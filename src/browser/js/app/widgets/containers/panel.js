var _widgets_base = require('../common/_widgets_base'),
    autolayout = require('autolayout/dist/autolayout.min.js'),
    editObject = function(){editObject = require('../../editor/edit-objects').editObject; editObject(...arguments)}


module.exports = class Panel extends _widgets_base {

    static options() {

        return {
            type:'panel',
            id:'auto',

            _style:'style',

            label:'auto',
            left:'auto',
            top:'auto',
            width:'auto',
            height:'auto',
            scroll:true,
            color:'auto',
            css:'',

            _layout:'layout',

            layout:'',
            spacing:0,

            _children:'children',

            widgets:[],
            tabs:[]
        }

    }

    constructor(widgetData) {


        var widgetHtml = `
            <div class="panel
                        ${!widgetData.scroll?'noscroll':''}
                        ${widgetData.tabs.length?'has-tabs':''}
                        ">
            </div>
        `

        super(...arguments, widgetHtml)

        var    parsers = require('../../parser'),
            parsewidgets = parsers.widgets,
            parsetabs = parsers.tabs

        if (widgetData.tabs.length) {
            parsetabs(widgetData.tabs,this.widget)
        } else {
            parsewidgets(widgetData.widgets,this.widget)
        }

        this.children = this.widget.find('> .widget')

        if (widgetData.layout != '') {
            try {

                var layout = widgetData.layout.replace(/\$([0-9])+/g, (m)=>{
                    return this.children[m.replace('$','')].abstract.widgetData.id
                })

                this.layout = new autolayout.View({
                    constraints: autolayout.VisualFormat.parse(layout.split('\\n').join('\n').split(' ').join(''), {extended: true}),
                    spacing: widgetData.spacing
                });

                this.widget.on('resize',(e, w, h)=>{
                    if (!w) {
                        var w = this.widget.width(),
                            h = this.widget.height()
                    }
                    this.layout.setSize(w,h)
                    this.applyLayout()
                })

            } catch(err) {
                throw `Visual Format Language error in ${widgetData.id}.layout: ${err.message} (line ${err.line})`
            }

        }
    }
    applyLayout(){
        this.widget.find('> .widget').each((i,widget)=>{
            var id = widget.abstract.widgetData.id
            if (!this.layout.subViews[id]) return
            var $widget = $(widget).addClass('absolute-position').css({'min-height':'auto','min-width':'auto'})
            for (var prop of ['height', 'width', 'top', 'left']) {
                delete widget.abstract.widgetData[prop]
                $widget.css(prop, this.layout.subViews[id][prop] + 'px')
            }
            if ($widget.hasClass('editing')) editObject($widget,widget.abstract.widgetData,true)
            $(window).resize()
        })
    }

}
