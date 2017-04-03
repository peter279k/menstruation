/*
 * Author: Digital Zoom Studio
 * Website: http://digitalzoomstudio.net/
 * Portfolio: http://bit.ly/nM4R6u
 * This is not free software.
 * ZoomBox v2.00
 */

"use strict";


Math.easeIn = function(t, b, c, d) {

    return -c *(t/=d)*(t-2) + b;

};

function cloneObject(source) {
    for (var i in source) {
        if (typeof source[i] == 'source') {
            this[i] = new cloneObject(source[i]);
        }
        else{
            this[i] = source[i];
        }
    }
}



var _zoombox_maincon;
window.zoombox_hardresize = false;
window.zoombox_forwardanimation = false;
window._zoombox_maincon = _zoombox_maincon;

window.zoombox_default_opts = {
    settings_paddingHorizontal: 'default'
    ,settings_paddingVertical: 'default'
    ,settings_resizemaincon: 'off'
    ,design_animation: 'fromcenter'
    ,design_skin: 'skin-gamma'
    ,design_borderwidth: 'default'
    ,settings_deeplinking: 'on'
    ,settings_disableSocial: 'off'
    ,settings_useImageTag: 'default' // -- use the img tag or div for displaying images
    ,zoombox_audioplayersettings : {}
    , settings_makeFunctional: false
    ,settings_usearrows: 'on'
    ,social_enableTwitterShare: 'on'
    ,social_enableGooglePlusShare: 'on'
    ,social_extraShareIcons: ''
    ,videoplayer_settings : {}
    ,audioplayer_settings : {}
    ,settings_extraClasses: ''
    ,settings_disablezoom: 'peritem'
    ,settings_zoom_doNotGoBeyond1X: 'off'
    ,settings_zoom_disableMouse: 'off'
    ,settings_enableSwipe: 'on'
    ,settings_enableSwipeOnDesktop: 'off'
    ,settings_galleryMenu: 'dock'
    ,settings_transition: 'fromcenter'
    ,settings_transition_gallery: 'slide'
    ,settings_transition_out: 'slideup'
    ,settings_transition_gallery_when_ready: 'on'
    ,settings_force_delay_time_for_loaded: 0
    ,settings_add_delay_time_for_gallery_transition: 0
    ,settings_add_delay_time_for_transition_in: 0
    ,settings_try_to_take_item_from_cache: 'on'
    ,settings_fullsize: 'off' // -- cover the whole screen on / off
    ,settings_holder_con_extra_classes: ''
    ,settings_holder_extra_classes: ''
    ,settings_callback_func_gotoItem : null

    //,settings_force_delay_time_for_loaded: 10
};



window.zoombox_default_opts_string = JSON.stringify(window.zoombox_default_opts);

//ZoomBox
(function ($) {

    function getSorted(selector, attrName) {
        return $($(selector).toArray().sort(function(a, b){
            var aVal = parseInt(a.getAttribute(attrName)),
                bVal = parseInt(b.getAttribute(attrName));
            return aVal - bVal;
        }));
    }


    $.fn.outerHTML = function() {
        return $(this).clone().wrap('<div></div>').parent().html();
    };

    var _conHolder
        , _holder = null
        , _theItem = null
        , _theDivItem = null
        ,_holderText = null
        , toload
        ,_holderBg
        ,_bigimageCon
        ,_bigimageThe
        ,_gallerymenuCon
        ,_conZoomboxArrows
        ;
    var maincon_orightml = '';
    //window params
    var _w;
    var ww
        , wh
        , cw
        , ch
        , iw //== item width
        , ih // == item height
        , width_border = 30
        ,bw //==big image width
        ,bh
        ,binw = 0 //bigimage natural width
        ,binh = 0 //bigimage natural height
        ,orig_bw
        ,orig_bh
        ,mouseX
        ,mouseY
        ,bi_viewIndexX = 0
        ,bi_viewIndexY = 0
        ,bigwidth = -1 // -- -1 = undefined
        ,bigheight = -1
        ,dims_scaling = 'proportional'
        ,the_type = 'thumb'
        ;
    var settings_paddingHorizontal = "default"
        ,settings_paddingVertical = "default"
        ;
    var gallerymenu_arr = []
        ,gallerymenu_startindex = 0
        ,gallerymenu_currindex = 0
        ;
    var busy = false;
    var int_calculateDims;


    var func_callback = null
        ;

    //==main options var
    var o = {};
    var loaded_opts = false
        ,lastargs = null
        ,lastlastargs = null
        ;
    var theurl = window.location.href;

    var translate_skin_nebula_closebtn = 'CLOSE <span class="strong-x">X</span>';


    var swipe_maintarget
        ,swipe_maintargettotalwidth = 0
        ,swipe_maintargettotalheight = 0
        ,swipe_maintargettotalclipwidth = 0
        ,swipe_maintargettotalclipheight = 0
        ,swipe_maintargetoriginalposx = 0
        ,swipe_maintargetoriginalposy = 0
        ,swipe_maintargettargetposx = 0
        ,swipe_maintargettargetposy = 0
        ,swipe_originalposx
        ,swipe_originalposy
        ,swipe_touchdownposx
        ,swipe_touchdownposy
        ,swipe_touchupposx
        ,swipe_touchupposy
        ,swipe_dragging = false
        ,dir_hor = false
        ,dir_ver = false
        ,has_zoom = true
        ,had_zoom = false// == works with o.settings_zoom_doNotGoBeyond1X / if the item is already at 1x there is no need to zoom, so we just remove the has-zoom class in that case
        ,animating_big_image = false
        ,fullwidth = false
        ,fullheight = false
        ,sw_stop_enter_frame = false
        ;


    var item_took_from_cache = false;


    var down_x = 0
        ,up_x = 0
        ,screen_mousex = 0
        ,dragging = false
        ,def_x = 0
        ,targetPositionX = 0
        ,_swiper = _conHolder
        ,_swiper_init_position = 0 // -- the swipper initial position before dragging
        ,currPageX = 0 // -- the current swiper position
        ,viewIndexY = 0
        ,viewIndexX = 0
        ,target_swiper = null
        ,paused_roll = false
        ,scaleFactor = 0
        ;


    var duration_viy = 20
        ,duration_vix = 20
        ;

    var target_viy = 0
        ,target_vix = 0
        ;

    var begin_viy = 0
        ,begin_vix = 0
        ;

    var finish_viy = 0
        ,finish_vix = 0
        ;

    var change_viy = 0
        ,change_vix = 0
        ;


    var inter_closezoombox = 0;

    var def_opts_parse = {};


    var _inline_content_orig_parent = null
        , _inline_content_orig_prev = null
        ,_inline_content_orig_parent_last = null
        , _inline_content_orig_prev_last = null
        ,last_zoombox_item_clicked = null
        ;

    var $zoombox_items_arr = [];

    $.fn.zoomBox = function (argo) {



        //var auxdef = JSON.parse(window.zoombox_default_opts_string);

        //delete def_opts_parse;
        def_opts_parse = {};



        var auxb = $.parseJSON(window.zoombox_default_opts_string);



        //console.log(auxb);



        //def_opts_parse  = JSON.parse(window.zoombox_default_opts_string);
        def_opts_parse  = $.extend(true, {},$.parseJSON(window.zoombox_default_opts_string));


        for (var key in auxb) {
            if (auxb.hasOwnProperty(key)) {
                var obj = auxb[key];
                def_opts_parse[key] = auxb[key];
            }
        }

        //console.info('def options',def_opts_parse,argo);
        //auxdef={};
        //console.info('DEFAULT OPTIONS ', loaded_opts, def_opts_parse,window.zoombox_default_opts_string);

        //console.log($.parseJSON(window.zoombox_default_opts_string))

        var defaults = def_opts_parse;
        //o = def_opts_parse;
//var o = {};
        //console.log(theurl);

        //lets singleton the main options
        if(!loaded_opts){
            o = $.extend(def_opts_parse, argo);
            loaded_opts = true;
        }else{
            o = $.extend(o, argo);
        }

        //console.log(maincon, busy);



        if(typeof window.zoombox_settings !='undefined'){
            if(typeof window.zoombox_settings.translate_skin_nebula_closebtn !='undefined'){
                translate_skin_nebula_closebtn = window.zoombox_settings.translate_skin_nebula_closebtn;
            }
        }





        $.fn.zoomBox.setOptions = function (argo) {
            if(argo.design_skin!=undefined){
                _zoombox_maincon.removeClass(o.design_skin);
                _zoombox_maincon.addClass(argo.design_skin);
            }
            if(argo.settings_extraClasses!=undefined){
                _zoombox_maincon.removeClass(o.settings_extraClasses);
                _zoombox_maincon.addClass(argo.settings_extraClasses);
            }
            o = $.extend(o, argo);
        };

        window.api_zoombox_setoptions = function (argo) {

            var new_opts = {};

            if(argo){
                new_opts = $.extend(defaults, argo);
            }

            if(_zoombox_maincon==null){ return false; };

            //console.info(new_opts);

            if(new_opts.design_skin!=undefined){
                _zoombox_maincon.removeClass('skin-darkfull skin-whitefull skin-default skin-gamma skin-nebula');
                _zoombox_maincon.addClass(new_opts.design_skin);
            }


            if(new_opts.settings_transition!=undefined){
                _zoombox_maincon.removeClass('transition-fromtop transition-fade');
                _zoombox_maincon.addClass('transition-'+new_opts.settings_transition);
            }

            // -- tbc

            if(new_opts.design_skin=='skin-darkfull'){
                if(_zoombox_maincon.children('.close-btn').length==0){
                    _zoombox_maincon.append('<div class="close-btn"></div>');
                }
                if(_zoombox_maincon.children('.title-con').length==0){
                    _zoombox_maincon.append('<div class="title-con"></div>');
                }
                if(_zoombox_maincon.children('.info-btn').length==0){
                    _zoombox_maincon.append('<div class="info-btn"></div>');
                }
                //_zoombox_maincon.append('<div class="close-btn"></div><div class="title-con"></div><div class="info-btn"></div>');
            }
            if(new_opts.settings_extraClasses!=undefined){
                _zoombox_maincon.removeClass(o.settings_extraClasses);
                _zoombox_maincon.addClass(new_opts.settings_extraClasses);
            }

            if(new_opts.settings_callback_func_gotoItem==null){
                func_callback = null;

            }else{

                func_callback = new_opts.settings_callback_func_gotoItem;
            }
            if(new_opts.settings_fullsize!="on"){
                _zoombox_maincon.removeClass('fullsize-on');

            }else{

                _zoombox_maincon.addClass('fullsize-on');
            }
            o = $.extend(o, new_opts);
        };


        //console.log(o, o.settings_callback_func_gotoItem);
        if(o.settings_callback_func_gotoItem) {
            func_callback = o.settings_callback_func_gotoItem;
        };
        window.api_zoombox_set_callback_func = function (argo) {
            func_callback = argo;
        };




        setup_paddings();




        $(this).data('zoombox_options', o);


        //console.info(_zoombox_maincon, busy);

        if (!(_zoombox_maincon) && busy == false) {
            init();
        }

//        _zoombox_maincon = undefined;
//        console.info(_zoombox_maincon, typeof _zoombox_maincon);


        //===trying to singleton it
        function init() {
            // -- singleton
            //console.info('--- init() zoombox', o);



            var aux = '<div class="zoombox-maincon disabled"><div class="zoombox-bg" onclick=""></div><div class="gallery-menu-con"></div><div class="bigimage-con"></div>';

            if(o.design_skin=='skin-darkfull'){
                aux+='<div class="close-btn"></div><div class="title-con"></div><div class="info-btn"></div>';
            }

            if(o.settings_transition_gallery=='helper-rectangle'){
                aux+='<div class="helper-rectangle"></div>';
            }


            //aux+='<div class="gallery-preloader"><div class="cube-preloader"></div></div>';
            aux+='<div class="gallery-preloader"><div class="loader"></div></div>';
            aux+='<div class="css-preloader"><div class="the-icon"></div></div></div>';

            $('body').append(aux);
            _zoombox_maincon = $('body').children('.zoombox-maincon');
            _bigimageCon = _zoombox_maincon.children('.bigimage-con');
            _gallerymenuCon = _zoombox_maincon.children('.gallery-menu-con');
            if(String(_zoombox_maincon.attr('class')).indexOf('skin-')==-1){
                _zoombox_maincon.addClass(o.design_skin);
            }

            maincon_orightml = _zoombox_maincon.html();


            if(_zoombox_maincon.hasClass('skin-gamma')){
                o.design_skin = 'skin-gamma';

                if(isNaN(parseInt(o.design_borderwidth, 10))){
                    o.design_borderwidth = 30;
                }
            }


            if(_zoombox_maincon.hasClass('skin-nebula')){
                o.design_skin = 'skin-nebula';

                if(isNaN(parseInt(o.design_borderwidth, 10))){
                    o.design_borderwidth = 0;
                }


                if(o.settings_useImageTag=='default'){
                    o.settings_useImageTag = 'off';
                }
            }

            //console.info(_zoombox_maincon.hasClass('skin-darkfull'), o.settings_useImageTag);
            if(_zoombox_maincon.hasClass('skin-darkfull')){


                if(o.settings_useImageTag=='default'){
                    o.settings_useImageTag = 'off';
                }
            }






            if(o.design_borderwidth=='default'){
                o.design_borderwidth = 30;
            }




            if(isNaN(parseInt(o.design_borderwidth, 10))){
                width_border = 30;
            }else{
                width_border = parseInt(o.design_borderwidth, 10);
            }


            if(o.settings_useImageTag=='default'){
                o.settings_useImageTag = 'on';
            }
            if(o.settings_useImageTag == 'on'){
            }

            _zoombox_maincon.addClass(o.settings_extraClasses);
            _zoombox_maincon.addClass('transition-'+ o.settings_transition);
            _zoombox_maincon.addClass('transition-gallery-'+ o.settings_transition_gallery);
            _zoombox_maincon.addClass('transition-out-'+ o.settings_transition_out);


            if(o.settings_fullsize=='on'){
                _zoombox_maincon.addClass('fullsize-'+'on');
            }


            _w = $(window);
            busy = true;
            setTimeout(function () {
                busy = false;
            }, 500);

            ww = $(window).width();

//            console.log(theurl, theurl.indexOf('zoombox='))
            if(theurl.indexOf('zoombox=')>-1){
//                console.log('testtt', get_query_arg(theurl, 'zoombox'));
                if(get_query_arg(theurl, 'zoombox')){
                    var tempNr = parseInt(get_query_arg(theurl, 'zoombox'),10);
//                    console.info(String(tempNr), String(tempNr)=='NaN');
                    if(String(tempNr)!='NaN'){
                        if(tempNr>-1){
                            goto_item($('.zoombox,.zoombox-delegated').eq(tempNr));
                        }
                    }else{

                        var auxobj = $('#'+get_query_arg(theurl, 'zoombox'));
                        goto_item(auxobj);
                    }
                }
                //$('.zoombox').eq
            }





            _w.bind('resize', handleResize);
            $(document).undelegate(".zoombox-bg", "click");
            $(document).undelegate(".zoombox-maincon > .close-btn", "click", handle_mouse);
            $(document).delegate(".zoombox-bg", "click", click_close);
            $(document).delegate(".zoombox-gotoprev-galleryitem", "click", handle_mouse);
            $(document).delegate(".zoombox-gotonext-galleryitem", "click", handle_mouse);
            $(document).delegate(".zoombox-maincon > .close-btn", "click", handle_mouse);
            $(document).delegate(".zoombox-maincon > .info-btn", "click", handle_mouse);
            $(document).bind("keyup", handle_keyup);

            handleResize();


            window.dzszb_open = function (arg, argtype, otherargs) {
                if (_zoombox_maincon == undefined) {
                    alert('please init zoomBox first')
                    return;
                }
                gotoItem(arg, argtype, otherargs);
            };
            window.dzszb_open_item = function (arg) {
                if (_zoombox_maincon == undefined) {
                    alert('please init zoomBox first')
                    return;
                }
                goto_item(arg);
            };
            /*
             */

            //== for legacy, did not work :(
            $.fn.zoomBox.open = function (arg, argtype, otherargs) {
                if (_zoombox_maincon == undefined) {
                    alert('please init zoomBox first')
                    return;
                }
                gotoItem(arg, argtype, otherargs);
            };

            $.fn.zoomBox.close = function () {
                if (_zoombox_maincon == undefined) {
                    alert('please init zoomBox first')
                    return;
                }
                click_close();
            };

            window.api_destroy_zoombox = destroy;


            handle_frame();
        }


        function destroy_listeners(){

            sw_stop_enter_frame = true;
            _zoombox_maincon = null;
            window._zoombox_maincon = null;

            o = defaults;

            _w.unbind('resize', handleResize);
            $(document).undelegate(".zoombox-bg", "click", click_close);
            $(document).undelegate(".zoombox-gotoprev-galleryitem", "click", handle_mouse);
            $(document).undelegate(".zoombox-gotonext-galleryitem", "click", handle_mouse);
            $(document).undelegate(".zoombox-maincon > .close-btn", "click", handle_mouse);
            $(document).undelegate(".zoombox-maincon > .info-btn", "click", handle_mouse);
            $(document).unbind("keyup", handle_keyup);

            window.api_destroy_zoombox=null;
            window.api_zoombox_setoptions = null;

            busy = false;
            loaded_opts = false;
            gallerymenu_arr = [];

            func_callback = null;
        }


        function destroy(){

            _zoombox_maincon.remove();
            destroy_listeners();

        }

        function handle_keyup(e){

            //console.info(e);

            if (e.which == 37) {
                _conZoomboxArrows.children('.zb-arrow-left').trigger('click');
                return false;
            }

            if (e.which == 39) {
                _conZoomboxArrows.children('.zb-arrow-right').trigger('click');
                return false;
            }

            if (e.which == 27) {
                close_zoombox();
                return false;
            }
        }

        function handleResize(e, pargs) {
            // --- if the resize has the same values no need for the resize function


            var margs = {
                init_calculateDims : true
                ,resize_maincon:true
                ,apply_settings_fullsize: true
                ,zoombox_hard_resize : false
            };


            if(pargs){
                margs = $.extend(margs,pargs);
            }

            //console.info(margs);

            if(margs.zoombox_hard_resize==false && window.zoombox_hardresize==false && (ww == _w.width() && wh == _w.height())){
                return;
            }



            ww = _w.width();
            wh = _w.height();
            //console.info(wh);

            //console.info(o.settings_resizemaincon)


            if(margs.resize_maincon){

                if(o.settings_resizemaincon=='on'){
                    _zoombox_maincon.css({ 'width': ww, 'height': wh });
                }
            }



            if(margs.apply_settings_fullsize){

                if(o.settings_fullsize=='on'){
                    if(_theItem){
                        _theItem.width(ww);
                        _theItem.height(wh);

                        //console.info(_theItem, _theItem.children('.info-con'));

                        if(_theItem.children('.main-con').length>0){
                            var _c = _theItem.children('.main-con').eq(0);

                            var auxw = 0.4*ww;
                            if(auxw>400){ auxw=400; }

                            var auxw2 = ww-auxw;


                            var _c_sliderCon = _c.children('.slider-con');


                            if(ww<=1000){

                                _c_sliderCon.css({
                                    'left' : ''
                                    ,'top' : ''
                                    ,'width' : ''
                                    ,'height' : ''
                                })
                                _c.children('.info-con').css('width','');
                            }else{


                                _c_sliderCon.outerWidth(auxw2);
                                _c_sliderCon.outerHeight(wh);
                                _c_sliderCon.css({
                                    'left' : auxw+'px'
                                    ,'top' : 0
                                })
                                _c.children('.info-con').outerWidth(auxw);
                            }




                            if(_c_sliderCon.attr('data-element-width') && _c_sliderCon.attr('data-element-height')){


                                var new_iw = 0;
                                var new_ih = 0;

                                var aux_sep_w = 80;
                                var aux_sep_h = 110;


                                var aux_iw = parseInt(_c_sliderCon.attr('data-element-width'),10);
                                var aux_ih = parseInt(_c_sliderCon.attr('data-element-height'),10);
                                var aux_ir = aux_iw/aux_ih;

                                var aux_sw = _c_sliderCon.outerWidth()-aux_sep_w*2;
                                var aux_sh = _c_sliderCon.outerHeight()-aux_sep_h*2;
                                var aux_sr = ww/wh;

                                if(aux_sr > aux_ir){

                                    new_iw = aux_iw*(aux_sh/aux_ih);
                                    new_ih = aux_sh;

                                }else{
                                    new_iw = aux_sw;

                                    new_ih = aux_ih * (aux_sw/aux_iw);
                                }


                                if(new_iw>aux_iw){
                                    new_iw = aux_iw;
                                    new_ih = new_iw * (aux_ih /aux_iw);
                                }

                                var _c_sliderCon_item = _c_sliderCon.find(' .advancedscroller, .divimage, .vplayer').eq(0);

                                //console.info(_c_sliderCon_item, aux_sw, new_ih, aux_sh, new_ih);
                                //console.info(aux_sw, new_iw);
                                _c_sliderCon_item.css({
                                    'position': 'absolute'


                                    ,'width': new_iw+'px'
                                    ,'height': new_ih+'px'
                                    ,'top': (aux_sep_h+(aux_sh - new_ih)/2)+'px'
                                    ,'left': (aux_sep_w+(aux_sw - new_iw)/2)+'px'
                                })


                                if(ww<=1000){

                                    _c_sliderCon_item.css({
                                        'left' : ''
                                        ,'top' : ''
                                        ,'width' : ''
                                        ,'height' : ''
                                        ,'position' : ''
                                    })
                                }


                                if(_c_sliderCon_item.hasClass('advancedscroller')){
                                    _c_sliderCon_item.get(0).api_force_resize();
                                }
                                if(_c_sliderCon_item.hasClass('vplayer')){




                                    if(_c_sliderCon_item.get(0).api_handleResize){
                                        _c_sliderCon_item.get(0).api_handleResize();
                                    }
                                }

                            }else{

                            }



                        }
                    }


                    if(o.design_skin=='skin-whitefull' && _theItem) {
                        _theItem.find('.zbox-responsive-media .divimage').css({

                            'position': ''
                            , 'width': ''
                            , 'height': ''
                            , 'top': ''
                            , 'left': ''

                        })

                        if(_theItem.find('.zbox-responsive-media .vplayer').length>0){
                            setTimeout(function(){
                                var _c2 = _theItem.find('.zbox-responsive-media .vplayer');

                                if(ww<1000){
                                    if(_theItem.find('.slider-con').eq(0).attr('data-element-width')){
                                        var auxw = Number(_theItem.find('.slider-con').eq(0).attr('data-element-width'));
                                        var auxh = Number(_theItem.find('.slider-con').eq(0).attr('data-element-height'));

                                        //console.info(auxw,auxh);

                                        _c2.eq(0).height(ww*auxh/auxw);

                                    }
                                }


                                if(_c2.get(0) && _c2.get(0).api_handleResize){


                                    _c2.get(0).api_handleResize();
                                }
                            },40);
                        }

                        if(_theItem.find('.zbox-responsive-media .advancedscroller').length>0){
                            setTimeout(function(){
                                var _c2 = _theItem.find('.zbox-responsive-media .advancedscroller');

                                if(_c2.get(0) && _c2.get(0).api_force_resize){


                                    _c2.get(0).api_force_resize();
                                }
                            },40);
                        }
                    }
                }
            }


            if(margs.init_calculateDims){

                clearTimeout(int_calculateDims);
                int_calculateDims = setTimeout(calculateDims, 600);
            }



            window.zoombox_hardresize = false;
        }

        function click_close(e) {
            var _t = $(this);
            //console.log(_t);
            _zoombox_maincon.find('.zoombox-bg').eq(0).removeClass('pureblack');
            close_zoombox();
        }

        window.api_close_zoombox = function(){
            close_zoombox();
        };

        function close_zoombox(){

            //console.info('close_zoombox()');


            $('body').removeClass('zoombox-opened');

            if(_conHolder!=undefined){

                restart_video_players()


                if(o.settings_transition_out=='slideup'){

                    //console.info(_conHolder, _conHolder.css('top'));
                    //_holder.animate({
                    //    'top':'-100%'
                    //},{
                    //    duration: 700
                    //    ,queue:false
                    //})

                    //console.info(_holder);
                    //return false;

                    if(ww<=1000){

                        _holder.css({
                            'opacity':0
                        });

                    }else{
                        if(o.settings_fullsize=='on'){

                            _holder.css({
                                'top':('0px')
                            })
                        }

                        setTimeout(function(){


                            _holder.css({
                                'top':('-'+wh+'px')
                            })
                        }, 50);
                    }

                }

                if(o.settings_transition_out=='fade'){

                    _conHolder.animate({
                        'opacity':0
                    },{
                        duration: 500
                        ,queue:false
                    });
                }
            }


            _zoombox_maincon.addClass('zoombox-closing');

            _zoombox_maincon.children('.gallery-menu-con').fadeOut('slow');
            _zoombox_maincon.children('.con-zoomboxArrows').fadeOut('slow');


            _zoombox_maincon.children('.zoombox-bg').animate({
                'opacity': 0
            },{
                queue:false
                ,duration: 600
            });



            if(_holderBg!=undefined){

                if(o.settings_transition=='fromcenter'){

                    _holderBg.css({
                        'width': 0
                        ,'height': 0
                        ,'margin-left': 0
                        ,'margin-top': 0
                    })
                }
            }


            //console.log(the_type,lastargs);

            if(the_type=='image'){
                /*
                 _theItem.addClass('no-animation');
                 _theItem.css({
                 'transform-origin' : 'center center'
                 })
                 setTimeout(function(){

                 _theItem.removeClass('no-animation');
                 _theItem.css({
                 'transform' : 'scale(0)'
                 ,'opacity' : '0'
                 })
                 },30)
                 */
                //console.log(_holder);

            }
            //console.log(_holderCon);
            if(_conHolder!=undefined){
                if(o.settings_transition=='fromcenter') {
                    //_conHolder.css({
                    //    'opacity': 0,
                    //    'transform': 'scale(0.3)'
                    //})
                }
            }


            //console.info(o.settings_transition_out);
            if(_theItem){


                if(o.settings_transition_out=='fade'){

                    //_theItem.css('opacity',0);
                }
            }



            if(_gallerymenuCon.html()!=''){
                //_gallerymenuCon.children().remove();
                gallerymenu_arr = [];
            }

            if(lastargs && lastargs.inline_content_move=='on'){

                setTimeout(function(){

                    if(_inline_content_orig_prev){

                        _inline_content_orig_prev.after(lastargs.$targetdiv);

                    }
                    if(_inline_content_orig_parent){

                        _inline_content_orig_parent.prepend(lastargs.$targetdiv);

                    }
                    _inline_content_orig_prev = null;
                    _inline_content_orig_parent = null;
                },500)
            }

            //console.info(_zoombox_maincon.hasClass('noanim'));
            if(_zoombox_maincon.hasClass('noanim')){
                _conHolder.hide();
                _zoombox_maincon.children('.zoombox-bg').hide();
                _zoombox_maincon.children('.gallery-menu-con').hide();
                _zoombox_maincon.children('.con-zoomboxArrows').hide();

                disable_zoombox();
            }else{


                setTimeout(function () {
                    disable_zoombox();
                }, 1000);
            }


            if(inter_closezoombox){
                clearTimeout(inter_closezoombox);
            }

            if(o.settings_deeplinking=='on' && has_history_api()==true){
                var newurl = add_query_arg(theurl, 'zoombox', "NaN");
                theurl = newurl;
                history.pushState({}, "", newurl);
            }
        }

        function disable_zoombox(){
            console.info('disable_zoombox()');

            _zoombox_maincon.html(maincon_orightml);
            _zoombox_maincon.addClass('disabled');
            busy = false;
            _zoombox_maincon.removeClass('zoombox-closing');



            _zoombox_maincon.removeClass('holder-loaded-firsttime');
        }



        function click_imageitem(e){

            var _t = $(this);
//            console.info(_t);


            if(_bigimageThe!=undefined || _t.parent().hasClass('has-zoom')==false){
                return;
            }
            _bigimageCon.append('<div class="the-bg"></div>');
            _bigimageCon.append(_t.clone());
            _bigimageThe = _bigimageCon.children('img').eq(0);

            animating_big_image=true;
            //console.info(animating_big_image);

            _bigimageThe.bind('touchstart', handle_touchStart);
            _bigimageThe.bind('touchmove', handle_touchMove);
            _bigimageThe.bind('touchend', handle_touchEnd);


            orig_bw = _bigimageThe.width();
            orig_bh = _bigimageThe.height();
            _bigimageThe.css('margin-left', orig_bw*(-0.5));
            _bigimageThe.css('margin-top', orig_bh*(-0.5));

            setTimeout(function(){
                //console.log(_bigimageThe.width());
                _bigimageThe.css('opacity',1);
                _bigimageThe.css('margin-left', 0);
                _bigimageThe.css('margin-top', 0);
                if(o.settings_zoom_disableMouse=='on'){

                    _bigimageThe.css('left', 0);
                    _bigimageThe.css('top', 0);
                }else{

                    _bigimageThe.css('left', 0);
                    _bigimageThe.css('top', 0);
                }



                _bigimageThe.unbind('mousemove');
                _bigimageThe.bind('mousemove',bigimage_handle_mouse);


                _bigimageThe.unbind('click');
                _bigimageThe.bind('click',bigimage_handle_mouse);
                _bigimageCon.addClass('active');

                if(ww<481){
                    $('html,body').animate({scrollTop: 0}, 500);
                    _zoombox_maincon.find('.zoombox-bg').eq(0).addClass('pureblack');
                }

                calculateDims();

            },500);
        }
        function handle_touchStart(e){
            //console.info('touchstart');
            swipe_maintarget = _bigimageThe;
            swipe_maintargettotalwidth = ww;
            swipe_maintargettotalclipwidth = bw;// should be bigger then totalwidth
            swipe_maintargettotalheight = wh;
            swipe_maintargettotalclipheight = bh;
            swipe_maintargetoriginalposx = parseInt(swipe_maintarget.css('left'), 10);
            swipe_maintargetoriginalposy = parseInt(swipe_maintarget.css('top'), 10);
            swipe_touchdownposx = e.originalEvent.touches[0].pageX;
            swipe_touchdownposy = e.originalEvent.touches[0].pageY;
            swipe_dragging = true;
        }
        function handle_touchMove(e){

            if(swipe_dragging==false){
                return;
            }else{
                if(dir_hor){
                    //console.log(swipe_maintargettotalwidth, swipe_maintargettotalclipwidth, swipe_maintargettotalheight, swipe_maintargettotalclipheight);
                    swipe_touchupposx = e.originalEvent.touches[0].pageX;
                    //console.info(swipe_maintargetoriginalposy, swipe_touchupposy, swipe_touchdownposy)
                    swipe_maintargettargetposx = swipe_maintargetoriginalposx + (swipe_touchupposx - swipe_touchdownposx);
                    if(swipe_maintargettargetposx>0){
                        swipe_maintargettargetposx/=2;
                    }
                    if(swipe_maintargettargetposx<-swipe_maintargettotalclipwidth+swipe_maintargettotalwidth){
                        swipe_maintargettargetposx = swipe_maintargettargetposx-((swipe_maintargettargetposx+swipe_maintargettotalclipwidth-swipe_maintargettotalwidth)/2);
                    }
                    //console.log(swipe_maintargettargetposx);

                    swipe_maintarget.css('left', swipe_maintargettargetposx);

                    if(swipe_maintargettargetposx>0){
                        swipe_maintargettargetposx = 0;
                    }
                    if(swipe_maintargettargetposx<-swipe_maintargettotalclipwidth+swipe_maintargettotalwidth){
                        swipe_maintargettargetposx = swipe_maintargettargetposx-(swipe_maintargettargetposx+swipe_maintargettotalclipwidth-swipe_maintargettotalwidth);
                    }
                }
                if(dir_ver){
                    swipe_touchupposy = e.originalEvent.touches[0].pageY;
                    //console.info(swipe_maintargetoriginalposy, swipe_touchupposy, swipe_touchdownposy)
                    swipe_maintargettargetposy = swipe_maintargetoriginalposy + (swipe_touchupposy - swipe_touchdownposy);
                    if(swipe_maintargettargetposy>0){
                        swipe_maintargettargetposy/=2;
                    }
                    if(swipe_maintargettargetposy<-swipe_maintargettotalclipheight+swipe_maintargettotalheight){
                        swipe_maintargettargetposy = swipe_maintargettargetposy-((swipe_maintargettargetposy+swipe_maintargettotalclipheight-swipe_maintargettotalheight)/2);
                    }
                    //console.log(swipe_maintargettargetposy);

                    swipe_maintarget.css('top', swipe_maintargettargetposy);

                    if(swipe_maintargettargetposy>0){
                        swipe_maintargettargetposy = 0;
                    }
                    if(swipe_maintargettargetposy<-swipe_maintargettotalclipheight+swipe_maintargettotalheight){
                        swipe_maintargettargetposy = swipe_maintargettargetposy-(swipe_maintargettargetposy+swipe_maintargettotalclipheight-swipe_maintargettotalheight);
                    }
                }
            }
            return false;
        }


        function handle_mouse(e){
            var _t = $(this);

            if(e.type=='click'){

                if(_t.hasClass('zoombox-gotoprev-galleryitem')){

                    goto_prev_galleryitem();
                }
                if(_t.hasClass('zoombox-gotonext-galleryitem')){

                    goto_next_galleryitem();
                }
                if(_t.hasClass('close-btn')){

                    close_zoombox();
                }
                if(_t.hasClass('info-btn')){

                    if(_t.hasClass('active')){

                        _t.removeClass('active');
                        _zoombox_maincon.find('.holder-text').removeClass('active');
                    }else{

                        _t.addClass('active');
                        _zoombox_maincon.find('.holder-text').addClass('active');
                    }

                }
            }
        }

        function handle_touchEnd(e){
            swipe_dragging = false;

            swipe_maintarget.css('left', swipe_maintargettargetposx);
            swipe_maintarget.css('top', swipe_maintargettargetposy);
            var aux = 0;
            if(dir_hor){
                aux = swipe_maintargettargetposx / -(swipe_maintargettotalclipwidth - swipe_maintargettotalwidth);
                //console.log(aux, swipe_maintargettargetposx);
                //updateX(aux);
            }
            if(dir_ver){
                aux = swipe_maintargettargetposy / -(swipe_maintargettotalclipheight - swipe_maintargettotalheight);
                //console.log(aux);
                //updateY(aux);
            }
        }
        function bigimage_handle_mouse(e){
            mouseX = e.pageX;
            mouseY = e.pageY;
            if(e.type=='mousemove'){
                if(_bigimageThe!=undefined){
                    if(bh>wh){
                        viewIndexY = (mouseY / wh) * (wh - bh);
//                        console.log(viewIndexY);
                        if(viewIndexY < (wh - bh)){
                            viewIndexY = (wh - bh);
                        }



                        if(o.settings_zoom_disableMouse=='on'){
                            viewIndexY = wh/2 - bh/2;
                        }

                    }else{
                        viewIndexY = 0;

                    }

                    if(bw>ww){
                        viewIndexX = (mouseX / ww) * (ww - bw);
                        //console.log(viewIndexY);
                        if(viewIndexX < (ww - bw)){
                            viewIndexX = (ww - bw);
                        }

                        if(o.settings_zoom_disableMouse=='on'){
                            viewIndexX = ww/2 - bw/2;
                        }

                    }else{
                        viewIndexX = 0;

                    }


                    if(is_ie8()){
                        _bigimageThe.css('top', viewIndexY);
                        _bigimageThe.css('left', viewIndexX);
                    }else{

                        finish_viy = viewIndexY;
                        finish_vix = viewIndexX;
                    }
                }
            }
            if(e.type=='click'){
                /*
                 _bigimageThe.css('width', orig_bw);
                 _bigimageThe.css('height', orig_bh);
                 _bigimageThe.css('margin-left', orig_bw*(-0.5));
                 _bigimageThe.css('margin-top', orig_bh*(-0.5));
                 _bigimageThe.css('left', '50%');
                 _bigimageThe.css('top', '50%');
                 _bigimageThe.css('opacity', '0');
                 */

                _bigimageThe.css({
                    'opacity' : 0
                    ,'transform' : 'scale(0.5)'
                    ,'-webkit-transform' : 'scale(0.5)'
                })

                _bigimageCon.removeClass('active');
                setTimeout(function(){
                    _zoombox_maincon.find('.zoombox-bg').eq(0).removeClass('pureblack');
                    _bigimageCon.html('');
                    animating_big_image = false;
                    _bigimageThe = undefined;
                },700);
            }
        }

        function handle_frame(){

            if(is_ie8()||is_ios()||is_android()||animating_big_image==false){


            }else{

                begin_viy = target_viy;
                change_viy = finish_viy - begin_viy;


                target_viy = Number(Math.easeIn(1, begin_viy, change_viy, duration_viy).toFixed(4));;

                begin_vix = target_vix;
                change_vix = finish_vix - begin_vix;


                target_vix = Number(Math.easeIn(1, begin_vix, change_vix, duration_vix).toFixed(4));;


                _bigimageThe.css('transform', 'translate3d('+target_vix+'px,'+target_viy+'px,0)');

            }

            if(sw_stop_enter_frame){
                return false;
            }

            requestAnimFrame(handle_frame);
        }
        function click_item(e) {


//            console.info('click_item');
            var _t = $(this);
            goto_item(_t, e);

            return false;

        }
        function goto_gallery(arg){
//            console.log(arg, );








            window.zoombox_forwardanimation = true;

            var args = {
                'clicked_from_gallery' : true
                ,'animation_forward' : true
            };


            //console.info(gallerymenu_currindex);


            if(arg<gallerymenu_currindex){
                args.animation_forward=false;
            }


            if(lastargs && lastargs.inline_content_move=='on'){

                _inline_content_orig_prev_last = _inline_content_orig_prev;
                _inline_content_orig_parent_last = _inline_content_orig_parent;


                lastlastargs = $.extend({}, lastargs);


                setTimeout(function(){


                    if(_inline_content_orig_prev_last){

                        _inline_content_orig_prev_last.after(lastlastargs.$targetdiv);

                    }
                    if(_inline_content_orig_parent_last){

                        _inline_content_orig_parent_last.prepend(lastlastargs.$targetdiv);

                    }
                    _inline_content_orig_prev_last = null;
                    _inline_content_orig_parent_last = null;
                },500)
            }


            goto_item(gallerymenu_arr[arg],null,args);



            setTimeout(calculateDims, 700)
        }

        function goto_item(arg, e,pargs){

            //console.info('goto_item', arg,pargs);
            // -- arg = object
            var _t = arg;
            var args = {};
            var arg = '';
            var auxtype = 'detect';




            var margs = {

                'clicked_from_gallery' : false
                ,'larger_desc' : ''
            };

            if(pargs){
                margs = $.extend(margs,pargs);
            }



            if(margs.clicked_from_gallery && _zoombox_maincon.hasClass('skin-whitefull')){
                //return false;
            }

            bigwidth = undefined; bigheight = undefined;


            // === we reinit these vars because they are deleted on lightbox close
            //console.info(_zoombox_maincon);
            _bigimageCon = _zoombox_maincon.children('.bigimage-con').eq(0);
            _gallerymenuCon = _zoombox_maincon.find('.gallery-menu-con').eq(0);

            if  (_t[0]!=undefined && _t[0].nodeName == "A") {
                _t.attr('data-src', _t.attr('href'));
            }

            //console.info()

            if (_t.attr('data-src') == undefined) {
                if (_t.attr('data-sourcemp4') != undefined) {
                    arg = _t.attr('data-sourcemp4');
                }
            } else {
                //console.log(arg, args);
                arg = _t.attr('data-src');
            }

            if (typeof _t.attr('data-type') == "undefined" || _t.attr('data-type')=='') {
                //args.type = 'image';
                auxtype = 'detect';
            } else {
                //args.type = _t.attr('data-type');
                auxtype = _t.attr('data-type');
            }


            if(auxtype=='detect'){
                if (arg.indexOf('.jpg') > -1 || arg.indexOf('.gif') > -1 || arg.indexOf('.jpeg') > -1 || arg.indexOf('.png') > -1) {
                    auxtype = 'image';
                }

                if (arg.indexOf('youtube.com/watch?') > -1) {
                    auxtype = 'video';
                    _t.attr('data-videotype', 'youtube');
                }
                if (arg.indexOf('vimeo.com/') > -1) {
                    auxtype = 'video';
                    _t.attr('data-videotype', 'vimeo');
                }
                if (arg.indexOf('dailymotion.com/video') > -1) {
                    auxtype = 'dailymotion';
                }
                if (arg.indexOf('soundcloud.com/') > -1) {
                    auxtype = 'soundcloud';
                }
                if (arg.indexOf('.html') > -1) {
                    auxtype = 'iframe';
                }


                if (arg.indexOf('.mp4') > -1 || arg.indexOf('.m4v') > -1) {
                    auxtype = 'video';
                }
                if (arg.indexOf('.mp3') > -1) {
                    auxtype = 'audio';
                }
                if (arg.indexOf('#') == 0) {
                    auxtype = 'inlinecontent';
                }

                if (_t.find('ul.scroller-items').length>0) {
                    auxtype = 'slider';
                }
            }

            //https://www?v=ylcPqmZ4ESw

//            console.log(_t, _t.attr('data-videotype'), auxtype, arg);

            if (typeof _t.attr('data-videotype') == "undefined") {
                margs.video_type = 'normal';
                //auxtype='detect';
            } else {
                margs.video_type = _t.attr('data-videotype');
            }

//            console.log(_t, _t.attr('data-type'), _t.attr('data-videotype'), auxtype, arg, margs.video_type);

            if (auxtype == 'youtube') {
//                console.info($.fn.vPlayer)
                if(typeof $.fn.vPlayer!='undefined'){
                    auxtype = 'video';
                    margs.video_type = 'youtube';
                }
            }
            if (auxtype == 'detect') {
                auxtype = 'image';
            }
            the_type = auxtype;

            if (_t.attr('data-sourceogg') != undefined) {
                margs.video_sourceogg = _t.attr('data-sourceogg');
            }
            if (_t.attr('data-sourcewebm') != undefined) {
                margs.video_sourcewebm = _t.attr('data-sourcewebm');
            }
            if (_t.attr('data-width') != undefined) {
                margs.width = _t.attr('data-width');
            }
            if (_t.attr('data-height') != undefined) {
                margs.height = _t.attr('data-height');
            }

            if (_t.attr('data-coverimage') != undefined) {
                margs.media_coverimage = _t.attr('data-coverimage');
            }
            if (_t.attr('data-disablezoom') != undefined) {
                margs.item_disablezoom = _t.attr('data-disablezoom');
            }

            if(o.design_skin == 'skin-nebula' && _t.find('.zoombox-larger-description').length>0){
                margs.title = _t.find('.zoombox-larger-description').eq(0).html();
            }else{
                if (typeof _t.attr('title') != "undefined" && _t.attr('title') != '') {
                    margs.title = _t.attr('title');
                }
                if (_t.attr('data-lightbox-title')) {
                    margs.title = _t.attr('data-lightbox-title');
                }
            }



            // -- lets seeeee if we have a gallery hier
            //console.log(_t, _t.attr('data-biggallery'),gallerymenu_arr.length, gallerymenu_arr);


            if(_t.attr('data-biggallery')!=undefined && _t.attr('data-biggallery')!='' && gallerymenu_arr.length==0){

                if(o.settings_galleryMenu=='dock'){
                    if(o.settings_paddingVertical<300){
                        //o.settings_paddingVertical = 300;
                        settings_paddingVertical = 300;
                        setTimeout(calculateDims,700);
                    }
                    var aux = '<div class="dzsdock" id=""><div class="items" style="opacity:0;">';
                    $('.zoombox[data-biggallery="'+_t.attr('data-biggallery')+'"]').each(function(){
                        var _cach = $(this);
                        //console.log(_cach,_cach.attr('data-biggallerythumbnail'));
                        //console.info(_cach, _cach.hasClass('hidden'));


                        if(_cach.hasClass('hidden') && _cach.attr('data-biggallerythumbnail')=='' && _cach.find('img').length==0 && _cach.find('.imgtobg').length==0){
                            return;
                        }

                        if(_cach.attr('data-biggallerythumbnail')){
                        }else{

                            //console.log(_cach);
                            if(_cach.find('img').length>0){
                                _cach.attr('data-biggallerythumbnail', _cach.find('img').eq(0).attr('src'));
                            }
                            //console.log(_cach, _cach.find('.imgtobg'));
                            if(_cach.find('.imgtobg').length>0){

                                var aux2 = _cach.find('.imgtobg').eq(0).css('background-image');
                                aux2 = aux2.replace('url(', '');
                                aux2 = aux2.replace(')', '');
                                aux2 = aux2.replace("'", '');
                                aux2 = aux2.replace('"', '');
                                ////console.info(aux2);
                                _cach.attr('data-biggallerythumbnail', aux2);
                            }
                        }

                        aux+='<span><img src="'+_cach.attr('data-biggallerythumbnail')+'"/>';
                        if(typeof(_cach.attr('href')) != 'undefined'){
                            if(_cach.attr('href').indexOf('youtube.com/watch')>-1){
                                aux+='<span class="hero-icon icon-video"></span>';
                            }
                            if(_cach.attr('href').indexOf('vimeo.com/')>-1){
                                aux+='<span class="hero-icon icon-video"></span>';
                            }
                            if(_cach.attr('href').indexOf('.mp4')>-1){
                                aux+='<span class="hero-icon icon-video"></span>';
                            }
                            if(_cach.attr('href').indexOf('dailymotion.com/')>-1){
                                aux+='<span class="hero-icon icon-video"></span>';
                            }
                        }

                        aux+='</span>';


                    });
                    aux+='</div></div>';
                    //console.log(gallerymenu_arr, gallerymenu_arr.length, aux);
                    _gallerymenuCon.html(aux);
                    //console.log(gallerymenu_arr, gallerymenu_arr.length, aux, _gallerymenuCon);
                    _gallerymenuCon.children('.dzsdock').dzsdock({
                        settings_callbackOnSelect: goto_gallery
                        ,settings_activeclass: 'activecss'
                        ,settings_startactive: gallerymenu_startindex
                    });
                }


                var auxi =0;

                //console.info(gallerymenu_arr,$('.zoombox[data-biggallery="'+_t.attr('data-biggallery')+'"]'));


                var $zoombox_gallery_arr = $('.zoombox[data-biggallery="'+_t.attr('data-biggallery')+'"],.zoombox-delegated[data-biggallery="'+_t.attr('data-biggallery')+'"]');

                //$zoombox_gallery_arr=[];

                //console.info(arg, margs, _t);


                if(_t.attr('data-zoombox-sort')){
                    $zoombox_gallery_arr = getSorted('.zoombox[data-biggallery="'+_t.attr('data-biggallery')+'"],.zoombox-delegated[data-biggallery="'+_t.attr('data-biggallery')+'"]', 'data-zoombox-sort');
                }


                //console.info('gallery arr is --> ',$zoombox_gallery_arr);

                $zoombox_gallery_arr.each(function(){

                    var _cach = $(this);



                    if(_cach.hasClass('hidden') && _cach.attr('data-biggallerythumbnail')=='' && _cach.find('img').length==0 && _cach.find('.imgtobg').length==0){
                        return;
                    }


                    gallerymenu_arr.push(_cach);
//                    console.log(_cach, _t, _cach==_t);
                    if(_cach[0] == _t[0]){
                        gallerymenu_startindex = auxi;
                    }
                    gallerymenu_currindex = gallerymenu_startindex;

                    //console.info(gallerymenu_currindex)

                    auxi++;
                });


                //console.info(gallerymenu_arr);


            }



            //console.log(arg, auxtype, margs);
            margs.e = e;
            margs.item = _t;

            fullwidth = false; fullheight = false;

            if(_t.attr('data-bigwidth')){

                margs.bigwidth = String(_t.attr('data-bigwidth')).replace('{{ww}}', ww);
                if(String(_t.attr('data-bigwidth'))=='{{ww}}'){

                    fullwidth=true;
                }
                //margs.bigwidth = _t.attr('data-bigwidth');
            }
            if(_t.attr('data-bigheight')){
                //console.info(_t.attr('data-bigheight'), String(_t.attr('data-bigheight')),wh);
                if(!wh){
                    wh = $(window).height();
                }
                margs.bigheight = String(_t.attr('data-bigheight')).replace('{{wh}}', wh);
                if(String(_t.attr('data-bigwidth'))=='{{ww}}'){
                    fullheight=true;
                }
                //margs.bigheight = _t.attr('data-bigheight');
            }
            if(_t && _t.attr('data-inline_content_move') && margs){
                margs.inline_content_move = String(_t.attr('data-inline_content_move'));
            }

            //console.log(margs);

            gotoItem(arg, auxtype, margs);
        }

        // ------- start gotoItem function - actually open the zoombox
        function gotoItem(arg, argtype, otherargs) {
            //console.log('gotoItem()',arg,argtype,otherargs);
            /// -- arg = the source path
            //  -- actually open the zoombox
            //console.info(argtype);
            if (argtype == undefined) {
                argtype = 'image';
            }

            if (is_ie8()) {

                _bigimageCon.css('display', 'none`');
            }


            //===define the event
            var e;
            if (otherargs != undefined && otherargs.e) {
                e = otherargs.e;
            }
            if (e != undefined && e.preventDefault != undefined) {
                e.preventDefault();
            }
            //console.log(arg, argtype, otherargs);

            if (argtype == 'detect') {
                //to be completed
            }

            var defaults = {
                video_sourceogg: '',
                video_title: '',
                video_type: 'normal',
                video_previewimg: '',
                bigwidth: '-1',
                bigheight: '-1',
                video_description: '',
                item: null,
                extra_classes: '',
                forcenodeeplink: "off",
                title: '',
                inline_content_move: 'off',
                animation_for_pastHolder_goForward: false
            };


            // -- video_width is bigwidth
            otherargs = $.extend(defaults, otherargs);

            otherargs.bigwidth = parseInt(otherargs.bigwidth, 10);
            otherargs.bigheight = parseInt(otherargs.bigheight, 10);
            lastargs = otherargs;
            //console.info(lastargs.$targetdiv, argtype, arg)
            //return false;

            //console.info(lastargs);


            last_zoombox_item_clicked = otherargs.item;

            //console.info(otherargs);

            if (argtype == 'inlinecontent') {
                lastargs.$targetdiv = $(arg).eq(0);
            }


            var holder_extra_css = '';
            var holder_con_extra_css = '';


            var str_comefromleft = '';


            //console.info('YESYES',_zoombox_maincon.children('.scroller').length);
            if (_zoombox_maincon.children('.scroller').length > 0) {
                //console.log(_zoombox_maincon.children('.scroller').eq(0));
                if (_zoombox_maincon.get(0) && _zoombox_maincon.get(0).api_destroy){

                    console.info('CALL DESTROY IN SCROLLER');
                    _zoombox_maincon.get(0).api_destroy();
                }
            }
            if(_zoombox_maincon.children('.currHolder').length>0) {
                restart_video_players();
                _zoombox_maincon.children('.currHolder').addClass('pastHolder').removeClass('currHolder');
            }else{

            }



            // -- moving transitioning gallery class here to see what happens
            if(lastargs.clicked_from_gallery){

                _zoombox_maincon.addClass('preparing-for-transitioning-gallery');
            }
            _zoombox_maincon.removeClass('disabled');





            if(o.settings_deeplinking=='on' && has_history_api()==true && otherargs.forcenodeeplink!='on'){
                //console.log(otherargs.item);

                $zoombox_items_arr = $('.zoombox,.zoombox-delegated')
                if(otherargs.item && otherargs.item.attr('data-zoombox-sort')){
                    //$zoombox_gallery_arr = getSorted('.zoombox,.zoombox-delegated', 'data-zoombox-sort');
                }

                var ind = $zoombox_items_arr.index(otherargs.item);
                if(typeof($(otherargs.item).attr('id'))!='undefined'){
                    ind = $(otherargs.item).attr('id');
                }



                theurl = window.location.href;
                var newurl = add_query_arg(theurl, 'zoombox', ind);
                if(newurl.indexOf(' ')>-1){
                    newurl = newurl.replace(' ', '%20');
                }
                theurl = newurl;
                //console.info(theurl);
                history.pushState({}, "", newurl);
            }

            var aux = '';
            //console.log(otherargs.item, gallerymenu_arr);

            if(o.settings_usearrows=='on' && gallerymenu_arr.length > 0){

                if(otherargs!=undefined && otherargs.item!=undefined){
                    for(var i=0;i<gallerymenu_arr.length;i++){
                        if(gallerymenu_arr[i][0] == otherargs.item[0]){
                            gallerymenu_currindex = i ;
                        }

                    }
                }
                //console.log(gallerymenu_currindex);
                aux = '<div class="con-zoomboxArrows">';
                if(gallerymenu_currindex>0){
                    aux+='<div class="zb-arrow-left"></div>';
                }
                if(gallerymenu_currindex<gallerymenu_arr.length-1){
                    aux+='<div class="zb-arrow-right">';



                    aux+='</div>';
                }
                aux+='</div>';
                if(_conZoomboxArrows!=undefined){
                    _conZoomboxArrows.remove();
                }

                _zoombox_maincon.children().eq(0).after(aux);

                _conZoomboxArrows = _zoombox_maincon.find('.con-zoomboxArrows').eq(0);

                _conZoomboxArrows.children('.zb-arrow-left').bind('click', function(){
                    //console.log('ceva');
                    goto_prev_galleryitem();
                })
                _conZoomboxArrows.children('.zb-arrow-right').bind('click', function(){
                    //console.log('ceva');
                    goto_next_galleryitem();
                })


            }else{
                _zoombox_maincon.children('.con-zoomboxArrows').remove();
            }

            //console.info(otherargs);

            if(otherargs.clicked_from_gallery){


                if(o.settings_transition_gallery=='slide'){

                    if(otherargs.animation_forward){

                        if(o.settings_fullsize=='on'){

                            holder_con_extra_css+=' left: 100%;';
                        }else{

                            holder_con_extra_css+=' left: 150%;';
                        }
                    }else{

                        if(o.settings_fullsize=='on'){

                            holder_con_extra_css+=' left: -100%;';
                        }else{

                            holder_con_extra_css+=' left: -150%;';
                        }
                    }


                }
            }else{

                if(o.settings_transition=='fromtop'){
                    holder_extra_css='top: -100%';
                }
            }

            //console.info(holder_con_extra_css);

            //console.info(o, o.settings_holder_con_extra_classes);
            aux = '<div class="holder-con currHolder '+otherargs.extra_classes+ o.settings_holder_con_extra_classes+'" style="'+holder_con_extra_css+'"><div class="holder-bg"></div><div class="holder-text">';

            //console.info(aux);


            if(o.design_skin=='skin-darkfull'){
                if(otherargs.item.children('.zoombox-larger-description').length>0){
                    aux+=otherargs.item.children('.zoombox-larger-description').eq(0).html();
                    _zoombox_maincon.children('.info-btn').removeClass('disabled active');
                }else{

                    _zoombox_maincon.children('.info-btn').addClass('disabled');
                }

            }
            //console.info(otherargs.item);


            //console.info('ceva', holder_extra_css, o.settings_transition);

            aux+='</div><div class="holder '+ o.settings_holder_extra_classes+'" style="'+holder_extra_css+'">';


            aux+='</div>';

            var socialS = '<div class="con-dropdowner social-options-con"><div class="auxpadder"></div><div class="social-btn"></div><div class="dropdowner forright">';


            socialS+='<iframe src="//www.facebook.com/plugins/like.php?href='+encodeURIComponent(theurl)+'&amp;send=false&amp;layout=standard&amp;width=300&amp;show_faces=false&amp;font=arial&amp;colorscheme=light&amp;action=like&amp;height=35&amp;appId=151389461684900" scrolling="no" frameborder="0" style="border:none; overflow:hidden; width:300px; height:35px;" allowTransparency="true"></iframe>';

            /*
             ==some code that does not work at the momment
             socialS+='<a href="https://twitter.com/share" style="display:inline-block; width:120px;"class="twitter-share-button" data-via="ZoomItFlash">Tweet</a><script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?"http":"h   ttps";if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+"://platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}}(document, "script", "twitter-wjs");</script>';

             if(window.gapi!=undefined){
             socialS+='<g:plusone size="medium"></g:plusone>';
             //console.log('ceva');
             }
             //socialS+='<div class="fb-comments" data-href="'+theurl+'" data-width="300" data-num-posts="10" style="height: 300px; overflow-y: scroll;"></div>';
             */

            if(o.social_enableTwitterShare=='on'){
                socialS+='<a target="_blank" href="https://twitter.com/share?url='+encodeURIComponent(theurl)+'%2Fpages%2Ftweet-button" class="lightboxanchor"><div class="lightboxicon-twitter"></div></a>';
            }
            if(o.social_enableGooglePlusShare=='on'){
                socialS+='<a target="_blank" href="https://plus.google.com/share?url='+encodeURIComponent(theurl)+'" class="lightboxanchor"><div class="lightboxicon-googleplus"></div></a>';
            }
            if(o.social_extraShareIcons!=''){
                var auxs = o.social_extraShareIcons;
                auxs = auxs.replace('{{currurl}}', encodeURIComponent(theurl));
                socialS+= auxs;
            }
            socialS+='<br/>';




            //console.info(theurl);
            //console.info(window.FB);
            if(window.FB!=undefined){
                socialS+='<br/><fb:comments href="'+theurl+'" width="300" num_posts="10" style="max-height:300px; overflow-y: scroll;"></fb:comments>';
            }
            socialS+='</div></div>';
            if(window.FB!=undefined){
                socialS+='<script>FB.XFBML.parse();</script>';
            }

            if(o.settings_disableSocial==undefined || o.settings_disableSocial!='on'){
                aux+=socialS;
            }

            var aux_close_btn = '<div class="close-btn">';
            if(o.design_skin=='skin-nebula'){
                aux_close_btn+=translate_skin_nebula_closebtn;
            }
            aux_close_btn+='</div>';
            aux+=aux_close_btn+'</div>';
            _zoombox_maincon.children().eq(0).after(aux);



            _conHolder = _zoombox_maincon.children('.currHolder');
            //console.info(_conHolder);
            _holderBg = _conHolder.children('.holder-bg');
            //console.info(_holderBg);
            _holder = _conHolder.find('.holder').eq(0);
            _conHolder.children('.close-btn').unbind('click', click_close);
            _conHolder.children('.close-btn').bind('click', click_close);
            _zoombox_maincon.undelegate('.btn-close-zoombox','click', click_close);
            _zoombox_maincon.delegate('.btn-close-zoombox','click', click_close);
            //console.log(argtype, otherargs, _conHolder);


            _holder.addClass('type-' + argtype);

            //==== animation start
            //setTimeout(function(){
            //    if(otherargs.clicked_from_gallery && o.settings_transition_gallery=='slide'){
            //        //console.info('hier',_conHolder);
            //        _conHolder.animate({
            //            //'left': '50%'
            //        },{
            //            queue:false
            //            ,duration: 500
            //        });
            //
            //
            //
            //        if(_zoombox_maincon.hasClass('skin-whitefull')){
            //            //console.info('yes');
            //
            //            _conHolder.animate({
            //                'left': '0%'
            //            }, { queue: false, duration: 2500});
            //        }
            //    };
            //},10)
            if(o.design_animation=='fromtop'){
                _holder.css({
                    'top': '-100%'
                });
            };


            if(o.design_animation=='noanim'){
                _zoombox_maincon.addClass('noanim');
            }else{
                _zoombox_maincon.removeClass('noanim');

            }


            has_zoom = true;

            if(argtype=='slider' &&typeof window.dzsas_init == 'undefined'){
                argtype='image';
            }

//            console.info(argtype);

            if (argtype == 'image') {



                var aux = '';
                aux = '<img class="the-item" src="' + arg + '"';
                if(o.settings_useImageTag=='off'){
                    aux+=' style="display:none;"'
                }
                aux+='/>';
                _holder.append(aux);
                if(o.settings_useImageTag=='off'){
                    _holder.append('<div class="the-item the-div-image-item" style="background-image: url('+arg+');"></div>');
                    _theDivItem = _holder.children('div.the-item').eq(0);
                }
                _theItem = _holder.children('img.the-item').last();
                toload = _holder.children('img').get(0);
//                console.log(_theItem, _theItem.width(), _theItem.attr('style'), _holder, toload);

                if (toload.complete == true && toload.naturalWidth != 0) {
                    itemLoaded(otherargs);
                } else {

                    //console.info('call itemLoaded from load event on image', otherargs)
                    $(toload).bind('load', itemLoaded);
                }

                if(o.settings_disablezoom=='peritem'){
                    if(otherargs.item_disablezoom == 'on'){
                        has_zoom=false;
                    }else{
                        has_zoom=true;
                    }
                }else{
                    if(o.settings_disablezoom=='on'){
                        has_zoom=false;
                    }
                }

                if(o.settings_useImageTag == 'off'){
                    has_zoom=false;
                }

//                console.info('haszoom', has_zoom);
                if(has_zoom){
                    _theItem.bind('click', click_imageitem);
                    _theItem.parent().addClass('has-zoom');
                }else{
                    _theItem.parent().removeClass('has-zoom');
                }


            }

            if (argtype == 'slider') {



                var aux = '';
                aux = '<div class="advancedscroller the-item skin-avanti-inset" style="width:100%; height: 503px"><ul class="items">';

                aux+=otherargs.item.find('.scroller-items').eq(0).html();

                aux+='</ul></div>';
                _holder.append(aux);


//                console.info(arg, otherargs.item, aux);
//                return;
                _theItem = _holder.children('div.the-item').last();

                window.dzsas_init(_theItem, {
                    settings_mode: "onlyoneitem"
                    ,design_arrowsize: "0"
                    ,settings_swipe: "on"
                    ,settings_swipeOnDesktopsToo: "on"
                    ,settings_slideshow: "on"
                    ,settings_slideshowTime: "300"
                    ,settings_autoHeight:"off"
                    ,settings_transition:"fade"
                    ,settings_centeritems:false
                })
//                console.log(_theItem, _theItem.width(), _theItem.attr('style'), _holder, toload);

                setTimeout(itemLoaded, 1000, otherargs);


                if(otherargs == undefined || otherargs.item == undefined || otherargs.item.attr('data-bigwidth')==undefined){
                    bigwidth = 800;
                }
                if(otherargs == undefined || otherargs.item == undefined || otherargs.item.attr('data-bigheight')==undefined){
                    bigheight = 500;
                }

            }
            if (argtype == 'notification') {

                _holder.append('<div class="the-item type-notification"></div>');
                _theItem = _holder.children().eq(1);
                _theItem.append('<div class="the-sizer">' + arg + '</div>');


                if (otherargs.width == undefined || otherargs.width == 0) {
                    otherargs.width = _theItem.outerWidth(false);
                    if (_theItem.children().length == 1) {
                        //console.log(_theItem.children().eq(0),_theItem.children().eq(0).outerWidth(false))
                        otherargs.width = _theItem.children().eq(0).outerWidth(false);
                    }
                }
                if (otherargs.height == undefined || otherargs.height == 0) {
                    otherargs.height = _theItem.outerHeight(false);
                    if (_theItem.children().length == 1) {
                        otherargs.height = _theItem.children().eq(0).outerHeight(false);
                    }
                }


                //console.log(_theItem, otherargs.width, otherargs.height)
                if (otherargs.width != undefined && otherargs.width != 0) {
                    _theItem.css({
                        'width': 1000, 'height': otherargs.height
                    })
                    bigwidth = otherargs.width;
                    bigheight = otherargs.height;
                }
                setTimeout(itemLoaded, 1000, otherargs);
                inter_closezoombox = setTimeout(close_zoombox, 5000);
            }

            if (argtype == 'inlinecontent') {

                if(otherargs.inline_content_move=='on'){
                    if($(arg).prev().length>0){
                        _inline_content_orig_prev = $(arg).prev();
                    }else{

                        _inline_content_orig_parent = $(arg).parent();
                    }
                }

                //console.info(_inline_content_orig_prev, _inline_content_orig_parent, $(arg));


                if(!otherargs.item || !otherargs.item.attr('data-ajaxhref')){

                    //console.info('yes?');
                    _holder.append('<div class="the-item type-inlinecontent"></div>');
                }
                _theItem = _holder.children('.the-item').eq(0);


                //console.info(_holder, _holder.children(),  _holder.children('.the-item'), 'theItem - ',  _theItem);



                if(otherargs && otherargs.inline_content_move=='on'){
                    _theItem.append(otherargs.$targetdiv);
                }else{
                    _theItem.append($(arg).clone());
                }

                //console.info(arg, $(arg));


                //console.info(_theItem);

                if(_theItem.children().eq(0).css('display')=='none'){
                    _theItem.children().eq(0).css('display','block');
                    _theItem.children().eq(0).removeClass('hidden');
                }

                //_theItem.children().eq(0).width(800);

                if (otherargs.width == undefined || otherargs.width == 0) {
                    otherargs.width = _theItem.outerWidth(false);
                    if (_theItem.children().length == 1) {
                        otherargs.width = _theItem.children().eq(0).outerWidth(false);
                    }
                }
                //console.info( _theItem.children().eq(0), _theItem.children().eq(0).outerWidth(false))
                if (otherargs.height == undefined || otherargs.height == 0) {
                    otherargs.height = _theItem.outerHeight(false);
                    if (_theItem.children().length == 1) {
                        otherargs.height = _theItem.children().eq(0).outerHeight(false);
                    }
                }
                //console.log(_theItem.children().eq(0), _theItem.children().eq(0).outerHeight(false), otherargs.width, otherargs.height, bigwidth, bigheight);

                if (otherargs.width != undefined && otherargs.width != 0) {
                    _theItem.css({
                        'width': otherargs.width, 'height': otherargs.height
                    })
                }




                if(otherargs == undefined || otherargs.item == undefined || otherargs.bigwidth<1){
                    bigwidth = 800;
                }

                if(otherargs.bigwidth>0){
                    bigwidth = otherargs.bigwidth;
                }
                if(otherargs == undefined || otherargs.item == undefined || otherargs.item.attr('data-bigheight')==undefined){
                    bigheight = 500;
                    if(o.design_skin=='skin-nebula'){
                        bigheight=650;
                    }
                }

                if(otherargs.bigheight>0){
                    bigheight = otherargs.bigheight;
                }

                //console.info(bigwidth,bigheight);



                window.dzszb_execute_target = _theItem;




                if(_theItem.find('.zbox-responsive-media').length>0){
                    var _c = _theItem.find('.zbox-responsive-media').eq(0);


                    if(_c.children().length==0){

                        if(_theItem.find('.slider-con').length>0){
                            _c.append(_theItem.find('.slider-con').eq(0).html());

                            //console.info(_theItem.find('.slider-con').eq(0).html());

                            if(_c.children('.advancedscroller').length>0){
                                _c.children('.arrow-left-for-skin-qcre').remove();
                                _c.children('.arrow-right-for-skin-qcre').remove();

                                _c.children('.advancedscroller').removeClass('skin-nonav').addClass('skin-qcre');

                                dzsas_init(_c.children('.advancedscroller'), { settings_mode: "onlyoneitem",design_arrowsize: "0" ,settings_swipe: "on" ,settings_autoHeight: "on",settings_autoHeight_proportional: "on",settings_swipeOnDesktopsToo: "on" ,settings_slideshow: "on" ,settings_slideshowTime: "150" });
                            }
                        }
                    }
                }

                _theItem.find('.toexecute').each(function(){
                    var _t2 = $(this);
                    if(_t2.hasClass('executed')==false){
                        window.meta_execute_target = _t2;
                        eval(_t2.text());
                        _t2.addClass('executed');
                    }
                });

                //console.log(otherargs.width, otherargs.height, bigwidth, bigheight);





                if(otherargs.item && otherargs.item.attr('data-ajaxhref')){


                    if(otherargs.item.data('dzszbx_ajaxdata')){

                        process_result(otherargs.item.data('dzszbx_ajaxdata'));
                    }else{
                        //console.info('fromaajax');
                        $.ajax({
                            url: otherargs.item.attr('data-ajaxhref'),
                            success: function (result) {
                                //if(window.console){ console.log(result) };
                                process_result(result);

                                otherargs.item.data('dzszbx_ajaxdata', result);
                            }
                        })
                    }




                }else{


                    //console.info('content move -- off');

                    setTimeout(function(){
                        //console.info(_holder.find('.vplayer').get(0));


                        if(o.videoplayer_settings.zoombox_video_autoplay=='on'){
                            //console.info('ceva');
                            if(_holder.find('.slider-con').length>0 && _holder.find('.slider-con').eq(0).children('.vplayer').length>0){

                                _holder.find('.slider-con > .vplayer').get(0).api_playMovie();
                            }
                        }


                        //console.info('what', _holder.find('.vplayer').get(0).api_seek_to_perc);


                    }, 1500);




                    if(_holder.find('.slider-con').length>0 && _holder.find('.slider-con').eq(0).children('.advancedscroller').length>0){

                        //console.info(_holder.find('.slider-con > .advancedscroller').get(0))

                        if( _holder.find('.slider-con > .advancedscroller').get(0) && _holder.find('.slider-con > .advancedscroller').get(0).api_goto_page){

                            _holder.find('.slider-con > .advancedscroller').get(0).api_goto_page(0);
                        }
                    }


                    if(_holder.find('.slider-con').length>0 && _holder.find('.slider-con').eq(0).children('.vplayer').length>0){

                        if(_holder.find('.slider-con > .vplayer').get(0) && _holder.find('.slider-con > .vplayer').get(0).api_playMovie) {
                            _holder.find('.slider-con > .vplayer').get(0).api_playMovie();
                        }

                        if( _holder.find('.slider-con > .vplayer').get(0).api_seek_to_perc){

                            _holder.find('.slider-con > .vplayer').get(0).api_seek_to_perc(0);
                            if(o.videoplayer_settings.zoombox_video_autoplay!='on'){

                                if(_holder.find('.slider-con > .vplayer').get(0) && _holder.find('.slider-con > .vplayer').get(0).api_pauseMovie){
                                    _holder.find('.slider-con > .vplayer').get(0).api_pauseMovie(0);
                                    _holder.find('.slider-con > .vplayer').get(0).api_reinit_cover_image();
                                }

                            }
                        }
                    }

                    //console.info('itemLoaded');



                    if(o.settings_transition=='fromcenter'){

                        setTimeout(itemLoaded, 1000,otherargs);
                    }else{
                        if(o.settings_transition=='fromtop'){

                            setTimeout(itemLoaded, 10,otherargs);
                        }else{

                            if(o.settings_transition=='fade'){

                                setTimeout(itemLoaded, 1000,otherargs);
                            }
                        }
                    }

                }

            }

            if (argtype == 'ajax') {
                $.ajax({
                    url: arg,
                    success: function (result) {
                        //if(window.console){ console.log(result) };
                        _holder.append('<div class="the-item ajax-content">' + result + '</div>');
                        _theItem = _holder.children().eq(1);

                        //console.log(_theItem.children().eq(0).width())
                        if (otherargs.width == undefined || otherargs.width == 0) {
                            otherargs.width = _theItem.outerWidth(false);
                            if (_theItem.children().length == 1) {
                                otherargs.width = _theItem.children().eq(0).outerWidth(false);
                            }
                        }
                        if (otherargs.height == undefined || otherargs.height == 0) {
                            otherargs.height = _theItem.outerHeight(false);
                            if (_theItem.children().length == 1) {
                                otherargs.height = _theItem.children().eq(0).outerHeight(false);
                            }
                        }
                        //console.log(otherargs.width, otherargs.height)
                        if (otherargs.width != undefined && otherargs.width != 0) {
                            _theItem.css({
                                'width': otherargs.width, 'height': otherargs.height
                            })
                        }
                        setTimeout(itemLoaded, 1000, otherargs);
                    }
                })

            }
            //console.log(arg,argtype);
            if (argtype == 'youtube') {

                //console.log()
                //console.log(arg, argtype, otherargs);
                if(arg.indexOf('youtube.com')>-1){
                    arg = jQuery.fn.urlParam(arg, "v");
                }

                //console.log(arg, argtype, otherargs);
                var style_w = '';
                var style_h = '';

                //console.log(otherargs);
                if (otherargs.width == undefined || otherargs.width == 0) {
                    otherargs.width = 800;
                }
                if (otherargs.height == undefined || otherargs.height == 0) {
                    otherargs.height = 500;
                }


                if (otherargs.width > 0) {
                    style_w = 'width:' + otherargs.width + 'px;';
                }
                if (otherargs.height > 0) {
                    style_h = 'height:' + otherargs.height + 'px;';
                }

                _holder.append('<iframe class="the-item" src="https://www.youtube.com/embed/' + arg + '?autoplay=1" style="border:0;' + style_w + style_h + '" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>');
                _theItem = _holder.children().eq(1);


                if(otherargs == undefined || otherargs.item == undefined || otherargs.item.attr('data-bigwidth')==undefined){
                    bigwidth = 800;
                }
                if(otherargs == undefined || otherargs.item == undefined || otherargs.item.attr('data-bigheight')==undefined){
                    bigheight = 500;
                }

                setTimeout(itemLoaded, 1000, otherargs);

            }
            if (argtype == 'dailymotion') {
                var aux = arg.split('_');
                //console.log(aux);
                var aux2 = String(aux[0]).split('/');
                var theid = aux2[aux2.length-1];
                //console.log(aux2, theid);
                var style_w = '';
                var style_h = '';

                //console.log(otherargs);
                if (otherargs.width == undefined || otherargs.width == 0) {
                    otherargs.width = 800;
                }
                if (otherargs.height == undefined || otherargs.height == 0) {
                    otherargs.height = 500;
                }

                _holder.append('<iframe class="the-item" src="http://www.dailymotion.com/embed/video/' + theid + '?autoplay=1" style="border:0;' + style_w + style_h + '" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>');
                _theItem = _holder.children().eq(1);

                if(otherargs == undefined || otherargs.item == undefined || otherargs.item.attr('data-bigwidth')==undefined){
                    bigwidth = 800;
                }
                if(otherargs == undefined || otherargs.item == undefined || otherargs.item.attr('data-bigheight')==undefined){
                    bigheight = 500;
                }

                setTimeout(itemLoaded, 1000, otherargs);
            }
            if (argtype == 'soundcloud') {

                //console.log(otherargs);
                if (otherargs.width == undefined || otherargs.width == 0) {
                    otherargs.width = 800;
                }
                if (otherargs.height == undefined || otherargs.height == 0) {
                    otherargs.height = 166;
                }
                _holder.append('<iframe class="the-item" src="https://w.soundcloud.com/player/?url=' + encodeURIComponent(arg) + '?autoplay=1" style="border:0;' + style_w + style_h + '" scrolling="no" frameborder="no" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>');
                _theItem = _holder.children().eq(1);

                if(otherargs == undefined || otherargs.item == undefined || otherargs.item.attr('data-bigwidth')==undefined){
                    bigwidth = 800;
                }
                if(otherargs == undefined || otherargs.item == undefined || otherargs.item.attr('data-bigheight')==undefined){
                    bigheight = 166;
                }

                setTimeout(itemLoaded, 1000, otherargs);
            }
            if (argtype == 'vimeo') {

                //console.log(arg, argtype, otherargs);
                //console.log()
                var aux = arg.split('vimeo.com/');
                arg = aux[1];
                var style_w = '';
                var style_h = '';

                //console.log(otherargs);
                if (otherargs.width == undefined || otherargs.width == 0) {
                    otherargs.width = 1024;
                }
                if (otherargs.height == undefined || otherargs.height == 0) {
                    otherargs.height = 768;
                }


                if (otherargs.width > 0) {
                    style_w = 'width:' + otherargs.width + 'px;';
                }
                if (otherargs.height > 0) {
                    style_h = 'height:' + otherargs.height + 'px;';
                }


                var str_autoplay = '0';

                if(o.videoplayer_settings && o.videoplayer_settings.zoombox_video_autoplay=='on'){
                    str_autoplay='1';
                }


                _holder.append('<iframe class="the-item" src="https://player.vimeo.com/video/' + arg + '?autoplay='+str_autoplay+'" style="border:0;"  webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>');
                _theItem = _holder.children().eq(1);


                if(otherargs == undefined || otherargs.item == undefined || otherargs.item.attr('data-bigwidth')==undefined){
                    bigwidth = 800;
                }
                if(otherargs == undefined || otherargs.item == undefined || otherargs.item.attr('data-bigheight')==undefined){
                    bigheight = 500;
                }

                setTimeout(itemLoaded, 1000, otherargs);

            }

            if (argtype == 'iframe') {
                var style_w = '';
                var style_h = '';
                if (otherargs.width > 0) {
                    style_w = 'width:' + otherargs.width + 'px;';
                }
                if (otherargs.height > 0) {
                    style_h = 'height:' + otherargs.height + 'px;';
                }

                //console.info(otherargs);


                if(otherargs == undefined || otherargs.item == undefined || otherargs.bigwidth<1){
                    bigwidth = 800;
                }

                if(otherargs.bigwidth>0){
                    bigwidth = otherargs.bigwidth;
                }
                if(otherargs == undefined || otherargs.item == undefined || otherargs.item.attr('data-bigheight')==undefined){
                    bigheight = 500;
                    if(o.design_skin=='skin-nebula'){
                        bigheight=650;
                    }
                }

                if(otherargs.bigheight>0){
                    bigheight = otherargs.bigheight;
                }

                //console.log(bigwidth);

                _holder.append('<iframe class="the-item" src="' + arg + '" style="border:0;' + style_w + style_h + '"/>');
                _theItem = _holder.children().eq(1);


                if(o.settings_useImageTag=='off'){
                    _theDivItem = _theItem;
                    _theDivItem.addClass('the-div-image-item');
                }

                if(_zoombox_maincon.hasClass('no-loading')){
                    itemLoaded(otherargs);
                }else{
                    setTimeout(itemLoaded, 1000, otherargs);
                }


            }

            //===type video
            if (argtype == 'video') {
                if(typeof(window.dzszvp_init)!='undefined'){

                    if(otherargs.bigwidth==-1){
                        bigwidth = 800;
                    }
                    if(otherargs.bigheight==-1){
                        bigheight = 500;
                    }

//                    console.info(bigwidth, bigheight);
                    var aux = '<div class="the-item"><div class="zoomvideoplayer"';
                    aux += ' data-source="' + arg + '"';
                    if (otherargs.video_sourceogg != '') {
                        aux += ' data-sourceogg="' + otherargs.video_sourceogg + '"';
                    }
                    if (otherargs.video_previewimg != '') {
                        aux += ' data-cover="' + otherargs.video_previewimg + '"';
                    }
                    aux += ' data-type="' + otherargs.video_type + '"';
                    aux += ' style="height: 100%;"';
                    aux += '>';



                    aux += '</div>';
                    /*
                     aux += '<script>jQuery(document).ready(function($){';
                     aux += 'var videoplayersettingsholder={ responsive:"on", autoplay: "on", design_skin: "' + o.design_skin + '"}; ';
                     aux += '$(".the-item .vplayer-tobe").vPlayer(videoplayersettingsholder);';
                     aux += '});</script>';
                     */
                    var videoplayersettingsholder={ autoplay: "off" };




                    videoplayersettingsholder = $.extend(videoplayersettingsholder, o.videoplayer_settings);

                    if(window.dzszvg_swfpath){
                        videoplayersettingsholder.url_playerlight = window.dzszvg_swfpath;
                    }

                    _holder.append(aux);
                    _holder.find('.zoomvideoplayer').eq(0).zoomvideoplayer(videoplayersettingsholder);
                    _theItem = _holder.children().eq(1).children().eq(0);
                    toload = _theItem.get(0);


                    if( bigwidth==-1 && (otherargs == undefined || otherargs.item == undefined || otherargs.item.attr('data-bigwidth')==undefined ) ){
                        bigwidth = 800;
                    }
                    if( bigheight==-1 && (otherargs == undefined || otherargs.item == undefined || otherargs.item.attr('data-bigheight')==undefined) ){
                        bigheight = 500;
                    }

                    setTimeout(itemLoaded, 1000, otherargs);

                    // -- we wait 2200 ms for playing the video so the transition has time to complete
                    setTimeout(function(){
                        if(_holder.find('.zoomvideoplayer').get(0) && _holder.find('.zoomvideoplayer').get(0).api_play_media){
                            _holder.find('.zoomvideoplayer').get(0).api_play_media();
                        }
                    }, 2200)
                }else{
                    if ($.fn.vPlayer != undefined) {

                        if(otherargs.bigwidth==-1){
                            bigwidth = 800;
                        }
                        if(otherargs.bigheight==-1){
                            bigheight = 500;
                        }

//                    console.info(bigwidth, bigheight);
                        var aux = '<div class="the-item"><div class="vplayer-tobe "';
                        if (otherargs.video_title != '') {
                            aux += ' data-videoTitle="' + otherargs.video_title + '"';
                        }
                        aux += ' data-sourcemp4="' + arg + '"';
                        if (otherargs.video_sourceogg != '') {
                            aux += ' data-sourceogg="' + otherargs.video_sourceogg + '"';
                        }
                        if (otherargs.video_previewimg != '') {
                            aux += ' data-img="' + otherargs.video_previewimg + '"';
                        }
                        aux += ' data-type="' + otherargs.video_type + '"';
                        aux += ' style="width:100%; height:100%; "';
                        aux += '>';
                        if (otherargs.video_description != '') {
                            aux += '<div class="videoDescription">' + otherargs.video_description + '</div>';
                        }


                        if(typeof otherargs.item !='undefined'){
                            if(otherargs.item.children()){
                                if(otherargs.item.children('.subtitles-con-input').length>0){
                                    aux+='<div class="subtitles-con-input">'+otherargs.item.children('.subtitles-con-input').html()+'</div>';
                                }
                            }
                            if(otherargs.item.children()){
                                if(otherargs.item.children('.cover-image').length>0){
                                    aux+=''+otherargs.item.children('.cover-image').eq(0).outerHTML()+'';
                                }
                            }
                        }

                        aux += '</div>';
                        /*
                         aux += '<script>jQuery(document).ready(function($){';
                         aux += 'var videoplayersettingsholder={ responsive:"on", autoplay: "on", design_skin: "' + o.design_skin + '"}; ';
                         aux += '$(".the-item .vplayer-tobe").vPlayer(videoplayersettingsholder);';
                         aux += '});</script>';
                         */
                        var videoplayersettingsholder={ responsive:"on", autoplay: "off" };

                        if(window.zoombox_videoplayersettings!=undefined){
                            if(window.zoombox_videoplayersettings.design_skin!=undefined){
                                videoplayersettingsholder.design_skin = window.zoombox_videoplayersettings.design_skin;
                            }
                            if(window.zoombox_videoplayersettings.settings_swfPath!=undefined){
                                videoplayersettingsholder.settings_swfPath = window.zoombox_videoplayersettings.settings_swfPath;
                            }


                        }
                        videoplayersettingsholder.videoWidth = '100%';
                        videoplayersettingsholder.videoHeight = '100%';
                        videoplayersettingsholder.design_skin = 'skin_aurora';
                        videoplayersettingsholder.zoombox_video_autoplay = 'on';

                        videoplayersettingsholder = $.extend(videoplayersettingsholder, o.videoplayer_settings);



                        if(window.dzsvg_swfpath){
                            videoplayersettingsholder.settings_swfPath = window.dzsvg_swfpath;
                        }

                        _holder.append(aux);
                        _holder.find('.vplayer-tobe').eq(0).vPlayer(videoplayersettingsholder);
                        _theItem = _holder.children().eq(1).children().eq(0);
                        toload = _theItem.get(0);


                        if( bigwidth==-1 && (otherargs == undefined || otherargs.item == undefined || otherargs.item.attr('data-bigwidth')==undefined ) ){
                            bigwidth = 800;
                        }
                        if( bigheight==-1 && (otherargs == undefined || otherargs.item == undefined || otherargs.item.attr('data-bigheight')==undefined) ){
                            bigheight = 500;
                        }

                        //console.info(bigwidth, bigheight);

                        if(videoplayersettingsholder.zoombox_video_autoplay=='off'){
                            videoplayersettingsholder.autoplay='off';
                        }

                        setTimeout(itemLoaded, 1000, otherargs);



                        // -- we wait 2200 ms for playing the video so the transition has time to complete
                        setTimeout(function(){
                            //console.info(_holder.find('.vplayer').get(0));
                            if(_holder.find('.vplayer').get(0) && _holder.find('.vplayer').get(0).api_playMovie){

                                //console.info(videoplayersettingsholder.zoombox_video_autoplay);



                                if(_holder.find('.vplayer').get(0).api_restart_video){

                                    _holder.find('.vplayer').get(0).api_restart_video();
                                }

                                //console.info(videoplayersettingsholder);


                                if(videoplayersettingsholder.zoombox_video_autoplay=='on'){

                                    _holder.find('.vplayer').get(0).api_playMovie();
                                }else{

                                    if(otherargs){

                                        //console.info('ceva');

                                        //_holder.find('.vplayer').get(0).api_pauseMovie();
                                    }
                                }
                                _holder.find('.vplayer').get(0).api_handleResize();



                            }
                        }, 2200)

                    } else {
                        if(window.console){ console.info('vplayer.js not included'); }
                        click_close();
                    }
                }
            }
            //===type video
            if (argtype == 'audio') {
                if ($.fn.audioplayer != undefined) {
                    var aux = '<div class="the-item"><div class="audioplayer-tobe"';
                    if (otherargs.video_title != '') {
                        aux += ' data-videoTitle="' + otherargs.video_title + '"';
                    }
                    aux += ' data-source="' + arg + '"';
                    if (otherargs.video_sourceogg != '') {
                        aux += ' data-sourceogg="' + otherargs.video_sourceogg + '"';
                    }
                    if (otherargs.media_coverimage != '') {
                        aux += ' data-thumb="' + otherargs.media_coverimage + '"';
                    }
                    //console.info(otherargs.item);

                    if(typeof otherargs!='undefined' && typeof otherargs.item!='undefined' && typeof $(otherargs.item).attr('data-waveformbg')!='undefined'){
                        aux+=' data-scrubbg="'+$(otherargs.item).attr('data-waveformbg')+'"';
                    }

                    if(typeof otherargs!='undefined' && typeof otherargs.item!='undefined' && typeof $(otherargs.item).attr('data-waveformprog')!='undefined'){
                        aux+=' data-scrubprog="'+$(otherargs.item).attr('data-waveformprog')+'"';
                    }

                    aux += ' data-type="'+otherargs.video_type+'"';
                    aux += ' style="width:100%; height:100%;"';
                    aux += '>';
                    if (otherargs.video_description != '') {
                        aux += '<div class="meta-artist">' + otherargs.video_description + '</div>';
                    }
                    aux += '</div>';
                    /*
                     aux += '<script>jQuery(document).ready(function($){';
                     aux += 'var videoplayersettingsholder={ responsive:"on", autoplay: "on", design_skin: "' + o.design_skin + '"}; ';
                     aux += '$(".the-item .vplayer-tobe").vPlayer(videoplayersettingsholder);';
                     aux += '});</script>';
                     */
                    o.audioplayer_settings.responsive="on";
                    o.audioplayer_settings.autoplay="on";

                    if(window.zoombox_audioplayersettings!=undefined){
                        if(window.zoombox_audioplayersettings.design_skin!=undefined){
                            o.audioplayer_settings.design_skin = window.zoombox_audioplayersettings.design_skin;
                        }
                        if(window.zoombox_audioplayersettings.settings_swfPath!=undefined){
                            o.audioplayer_settings.settings_swfPath = window.zoombox_audioplayersettings.settings_swfPath;
                        }


                    }
                    o.audioplayer_settings.videoWidth = '100%';
                    o.audioplayer_settings.videoHeight = '100%';

                    _holder.append(aux);
                    _holder.find('.audioplayer-tobe').eq(0).audioplayer(o.audioplayer_settings);
                    _theItem = _holder.children().eq(1).children().eq(0);
                    toload = _theItem.get(0);




                    if(otherargs == undefined || otherargs.item == undefined || otherargs.item.attr('data-bigwidth')==undefined){
                        bigwidth = 800;
                    }
                    if(otherargs == undefined || otherargs.item == undefined || otherargs.item.attr('data-bigheight')==undefined){
                        bigheight = 240;
                    }



                    setTimeout(itemLoaded, 1000, otherargs);
                } else {
                    if(window.console){ console.info('audioplayer.js not included'); };
                    click_close();
                }
            }

            //console.info(otherargs)

            if(typeof bigwidth=="undefined"){
                if(otherargs != undefined && otherargs.item != undefined && otherargs.item.attr('data-bigwidth')){
                    bigwidth = otherargs.item.attr('data-bigwidth');
                }else{
                    bigwidth = undefined;
                }
            }
            if(typeof bigheight=="undefined"){
                if(otherargs != undefined && otherargs.item != undefined && otherargs.item.attr('data-bigheight')){
                    bigheight = otherargs.item.attr('data-bigheight');
                }else{
                    bigheight = undefined;
                }
            }


//            console.info(otherargs);

            if(typeof otherargs.item!='undefined' && otherargs.item && typeof otherargs.item.attr('data-scaling')!='undefined'){
                dims_scaling = otherargs.item.attr('data-scaling');
            }else{
                dims_scaling = 'proportional';
            }


            if(bigwidth == -1 && otherargs.bigwidth!=-1){
                bigwidth = otherargs.bigwidth;
            }
            if(bigheight == -1 && otherargs.bigheight!=-1){
                bigheight = otherargs.bigheight;
            }
            if(typeof otherargs.dims_scaling!="undefined"){
                dims_scaling = otherargs.dims_scaling;
            }

            //console.info(dims_scaling);



            //console.info(_zoombox_maincon.children('.pastHolder'));


            //console.info(o.settings_transition_gallery);

            if(o.settings_transition_gallery_when_ready!='on'){

                console.info('call transition_pastholder from gotoItem()')
                transition_pastholder(otherargs)
            }

            //=== animation END


            if(typeof otherargs.title!='undefined' && otherargs.title!=''){
                if(o.design_skin=='skin-nebula'){
                    _conHolder.find('.holder-text').remove();
                    _holder.append('<div class="holder-text"></div>');
                    _holderText = _holder.children('.holder-text').eq(0);
                }else{
                    _holderText = _conHolder.find('.holder-text').eq(0);
                }
                if(o.design_skin=='skin-darkfull'){

                    _holderText = _zoombox_maincon.children('.title-con');

                }




                var pat1 = new RegExp('{{currurl}}',"g");
                auxs = String(otherargs.title).replace(pat1, window.location.href);


                if(o.design_skin=='skin-darkfull'){
                    //console.info(gallerymenu_currindex, gallerymenu_arr.length)
                }

                var aux2 = gallerymenu_currindex+1;

                if(aux2<10){
                    aux2 = '0' + String(aux2);
                }

                var aux3 = gallerymenu_arr.length;

                if(aux3<10){
                    aux3 = '0' + String(aux3);
                }

                auxs = '<h3>'+auxs+'</h3><div class="index-definer">'+aux2+'/'+aux3+'</div>'



                if(o.design_skin=='skin-darkfull'){

                    _holderText = _zoombox_maincon.children('.title-con');

                    if(_zoombox_maincon.children('.title-con').html()!=''){

                        _zoombox_maincon.children('.title-con').addClass('hidden-title');
                        setTimeout(function(){

                            _holderText.html(auxs);
                            _zoombox_maincon.children('.title-con').removeClass('hidden-title');
                        },300)


                    }else{

                        _holderText.html(auxs);
                    }
                }else{

                    _holderText.html(auxs);
                }

            }



            if(o.design_skin=='skin-darkfull'){

                _zoombox_maincon.children('.zoombox-bg').animate({
                    'opacity': 1
                },{
                    queue:false
                    ,duration: 300
                });
            }


            window.zoombox_forwardanimation = false;

            //console.log(arg, argtype, _theItem);


            //console.log(has_history_api());

            //console.info(func_callback);
            if(func_callback){
                func_callback(_holder);
            }


            // -- just want to cancel the default click behaviour on links
            if (e != undefined && e != null) {
                e.preventDefault();
            }


            function process_result(result){

                //console.info(otherargs.item.data('dzszbx_cache_obj'));
                item_took_from_cache=false;
                if(o.settings_try_to_take_item_from_cache=='on' && otherargs.item.data('dzszbx_cache_obj')){

                    _holder.append(otherargs.item.data('dzszbx_cache_obj'));
                    item_took_from_cache=true;
                    console.info('item_took_from_cache');
                }else{

                    _holder.append('<div class="the-item ajax-content">' + result + '</div>');
                }

                _theItem = _holder.children('.the-item').eq(0);

                //console.log(_theItem.children().eq(0).width())
                if (otherargs.width == undefined || otherargs.width == 0) {
                    otherargs.width = _theItem.outerWidth(false);
                    if (_theItem.children().length == 1) {
                        otherargs.width = _theItem.children().eq(0).outerWidth(false);
                    }
                }
                if (otherargs.height == undefined || otherargs.height == 0) {
                    otherargs.height = _theItem.outerHeight(false);
                    if (_theItem.children().length == 1) {
                        otherargs.height = _theItem.children().eq(0).outerHeight(false);
                    }
                }
                //console.log(otherargs.width, otherargs.height)
                if (otherargs.width != undefined && otherargs.width != 0) {
                    _theItem.css({
                        'width': otherargs.width, 'height': otherargs.height
                    })
                }




                window.dzszb_execute_target = _theItem;

                _theItem.find('.toexecute').each(function(){
                    var _t2 = $(this);
                    if(_t2.hasClass('executed')==false){
                        window.meta_execute_target = _t2;
                        eval(_t2.text());
                        _t2.addClass('executed');
                    }
                });

                if(o.settings_transition=='fromcenter'){

                    setTimeout(itemLoaded, 1000,otherargs);
                }else{
                    if(o.settings_transition=='fromtop'){

                        setTimeout(itemLoaded, 10,otherargs);
                    }
                }
            }



        }
        //END -- gotoItem


        function transition_pastholder(otherargs){

            //console.info('transition_pastholder',otherargs);

            //return false;


            var delay_time = 20 + o.settings_add_delay_time_for_gallery_transition;

            if(lastargs && lastargs.clicked_from_gallery){




                if(o.settings_transition_gallery=='slide'){

                    //console.info(delay_time);
                    setTimeout(function(){
                        if(lastargs.animation_forward){


                            //console.info(_zoombox_maincon.children('.pastHolder'))
                            _zoombox_maincon.children('.pastHolder').animate({
                                'left': '-50%'
                            }, { queue: false, duration: 250});


                            if(_zoombox_maincon.hasClass('skin-whitefull')){

                                _zoombox_maincon.children('.pastHolder').animate({
                                    'left': '-100%'
                                }, { queue: false, duration: 250});
                            }

                        }else{

                            _zoombox_maincon.children('.pastHolder').animate({
                                'left': '150%'
                            }, { queue: false, duration: 250});


                            if(_zoombox_maincon.hasClass('skin-whitefull')){

                                _zoombox_maincon.children('.pastHolder').animate({
                                    'left': '100%'
                                }, { queue: false, duration: 250});
                            }
                        }
                    },delay_time)


                }else{

                    //_zoombox_maincon.children('.pastHolder').css({
                    //    'left': aux_left
                    //    ,'top': '25%'
                    //    , 'margin-left' : 0
                    //    , 'margin-top' : 0
                    //    ,'opacity':0
                    //    ,'transform' : 'scale(0)'
                    //    ,'-webkit-transform' : 'scale(0)'
                    //}, { queue: false, easing: 'swing', duration: 1000});
                }
            }

            if(o.settings_transition_gallery=='helper-rectangle'){
                delay_time+=800;
            }

            setTimeout(function(){

                //console.info(otherargs);

                // -- remove zoombox container
                //console.info("REMOVE IT");

                if(last_zoombox_item_clicked){

                    last_zoombox_item_clicked.data('dzszbx_cache_obj', _conHolder.find('.the-item').eq(0));
                }

                //otherargs.item.data('dzszbx_cache_obj', _conHolder.find('.the-item').eq(0))
                _zoombox_maincon.children('.pastHolder').remove();

                _zoombox_maincon.removeClass('preparing-for-transitioning-gallery');
                _zoombox_maincon.removeClass('transitioning-gallery');

            },delay_time + 600);
        }

        function itemLoaded(args) {

            //console.info('itemLoaded()' , args, $(this), gallerymenu_arr, _theItem, _theItem.find('.activate-only-when-zoombox-nav'));

            //console.info(_theItem);


            if(_zoombox_maincon.hasClass('skin-whitefull') && lastargs.clicked_from_gallery) {

                //console.info('return');
                //return false;
            }
            if(o.settings_transition_gallery_when_ready=='on'){

                transition_pastholder(args)
            }

            if(gallerymenu_arr.length>1){
                _theItem.find('.activate-only-when-zoombox-nav').addClass('active');
            }




            var delay_time = 10 + o.settings_add_delay_time_for_transition_in;

            if(lastargs && lastargs.clicked_from_gallery){
                delay_time+= o.settings_add_delay_time_for_gallery_transition;
            }

            // -- moving transitioning gallery class here to see what happens
            if(lastargs.clicked_from_gallery){

                _zoombox_maincon.addClass('transitioning-gallery');
            }
            setTimeout(function(){

                //console.info('going down for real!! -- transitioning gallery, transitioning gallery', lastargs, _conHolder, o.settings_transition)
                if(lastargs.clicked_from_gallery){



                    if(o.settings_transition_gallery=='slide'){



                        if(_zoombox_maincon.hasClass('skin-whitefull')){


                            //console.info('animate to 0%')
                            _conHolder.animate({
                                'left': '0%'
                            }, { queue: false, duration: 250});
                        }else{

                            _conHolder.animate({
                                'left' : '50%'
                            },{
                                duration: 250
                                ,queue:false
                                ,complete:function(){

                                    $(this).css({
                                        'left' : ''
                                    });
                                }
                            })

                            if(ww<=520 && o.design_skin=='skin-darkfull'){

                                _conHolder.animate({
                                    'left' : '0%'
                                },{
                                    duration: 250
                                    ,queue:false
                                    ,complete:function(){

                                        $(this).css({
                                            'left' : ''
                                        });
                                    }
                                })
                            }
                        }
                    }
                }else{


                    //console.info('fromtop',_holder.css('top'));
                    if(o.settings_transition=='fromtop'){
                        _conHolder.css({
                            'left' : 0
                        })
                        //_holder.animate({
                        //    'top' : '0%'
                        //},{
                        //    queue:false
                        //    ,duration: 1000
                        //})
                        _holder.css({
                            'top' : '0%'
                        })
                    }
                }
            },delay_time);

            //console.info(_theItem.find('.replace-social-here'),_conHolder.find('.social-options-con .dropdowner').eq(0))
            _theItem.find('.replace-social-here').append(_conHolder.find('.social-options-con .dropdowner').eq(0).children());

            //calculateDims();


            if(o.design_skin!='skin-darkfull'){

                _zoombox_maincon.children('.zoombox-bg').animate({
                    'opacity': 1
                },{
                    queue:false
                    ,duration: 300
                });
            }


            var delaytime = 700;

            if(o.settings_transition=='fromtop'){
                delaytime=1100;
            }

            if(o.settings_transition=='fromcenter'){
                delaytime=900;
            }
            if(o.settings_transition=='fade'){
                delaytime=900;
            }
            //console.log(o.settings_transition);

            if(o.settings_force_delay_time_for_loaded){
                delaytime = o.settings_force_delay_time_for_loaded;
            }

            if(lastargs.clicked_from_gallery && o.settings_transition_gallery=='slide'){
                delay_time=0;
            }

            setTimeout(function () {
                //$(window).trigger('resize');
                _holder.addClass('loaded');
                _zoombox_maincon.addClass('holder-loaded-firsttime');

                //
                calculateDims();


                if(gallerymenu_arr.length>1 && o.settings_enableSwipe=='on'){
                    if(is_ios() || is_android()){
                        setupSwipe();
                    }else{
                        if(o.settings_enableSwipeOnDesktop=='on'){
                            setupSwipe();
                        }
                    }
                }

                if(o.design_skin=='skin-whitefull'){

                    //console.info(item_took_from_cache);
                    if(args && args.inline_content_move!='on' && item_took_from_cache==false){
                        //console.info('REINIT TWITTER AND FACEBOOK');
                        if(window.twttr && window.twttr.widgets && window.twttr.widgets.load){
                            //console.info('twitter - load');
                            twttr.widgets.load()
                        }
                        if(window.FB && window.FB.XFBML && window.FB.XFBML.parse){
                            //console.info('twitter - load');
                            FB.XFBML.parse()
                        }


                    }




                    setTimeout(function(){
                        //console.log(_zoombox_maincon.find('.css-preloader > .the-icon'));

                        _zoombox_maincon.find('.css-preloader > .the-icon').hide();
                    },300);
                    // -- let's try to not load

                    //console.info(_theItem.children());
                }
                $('body').addClass('zoombox-opened');
            }, delaytime);





        };

        function restart_video_players(){

            _zoombox_maincon.children('.currHolder').find('.vplayer').each(function(){
                var _t = $(this);
                //console.info(_t);

                if(_t.get(0) && _t.get(0).api_seek_to_perc && o.design_skin!='skin-darkfull'){
                    _t.get(0).api_seek_to_perc(0);
                }
            })
        }


        function goto_next_galleryitem(){
            //console.info('goto_next_galleryitem()');
            var tempNr = gallerymenu_currindex+1;
            if(tempNr>=gallerymenu_arr.length){
                tempNr=0;
            }

            window.zoombox_forwardanimation = true;

            var args = {
                'clicked_from_gallery' : true
                ,'animation_forward' : true
            };





            if(lastargs && lastargs.inline_content_move=='on'){

                _inline_content_orig_prev_last = _inline_content_orig_prev;
                _inline_content_orig_parent_last = _inline_content_orig_parent;


                lastlastargs = $.extend({}, lastargs);


                setTimeout(function(){


                    if(_inline_content_orig_prev_last){

                        _inline_content_orig_prev_last.after(lastlastargs.$targetdiv);

                    }
                    if(_inline_content_orig_parent_last){

                        _inline_content_orig_parent_last.prepend(lastlastargs.$targetdiv);

                    }
                    _inline_content_orig_prev_last = null;
                    _inline_content_orig_parent_last = null;
                },500)
            }


            goto_item(gallerymenu_arr[tempNr],null,args);
        }
        function goto_prev_galleryitem(){

            var tempNr = gallerymenu_currindex-1;
            if(tempNr<0){
                tempNr = gallerymenu_arr.length-1;
            }



            window.zoombox_forwardanimation = false;

            var args = {
                'clicked_from_gallery' : true
                ,'animation_forward' : false
            };



            //if(_zoombox_maincon.hasClass('skin-whitefull')){
            //    return false;
            //}




            // -- content move block

            var delaytime = 500;
            delaytime+= o.settings_add_delay_time_for_gallery_transition;
            if(lastargs && lastargs.inline_content_move=='on'){

                _inline_content_orig_prev_last = _inline_content_orig_prev;
                _inline_content_orig_parent_last = _inline_content_orig_parent;


                lastlastargs = $.extend({}, lastargs);


                setTimeout(function(){


                    //console.info(_inline_content_orig_prev_last, _inline_content_orig_parent_last, lastlastargs.$targetdiv)
                    if(_inline_content_orig_prev_last){

                        _inline_content_orig_prev_last.after(lastlastargs.$targetdiv);

                    }
                    if(_inline_content_orig_parent_last){

                        _inline_content_orig_parent_last.prepend(lastlastargs.$targetdiv);

                    }
                    _inline_content_orig_prev_last = null;
                    _inline_content_orig_parent_last = null;
                },delaytime)
            }

            //console.info(gallerymenu_arr);

            goto_item(gallerymenu_arr[tempNr],null,args);

        }
        function setupSwipe(){

            //---- WIP

            var cthis = _conHolder;

            if(cthis.find('.the-item').eq(0).children().eq(0).hasClass('vplayer')){
                return false;
            }

            cthis.addClass('swipe-enabled');
            //console.log('setupSwipe');//swiping vars

            _swiper = _conHolder;

            var sw_cancel_click = false;


            var _t = cthis;
//                console.log(_t, sw_tw, sw_ctw);

            _swiper.bind('mousedown', function(e){
                target_swiper = cthis;
                down_x = e.screenX;
                dragging=true;
                paused_roll=true;
                cthis.addClass('closedhand');
                _swiper_init_position = _swiper.offset().left - _swiper.parent().offset().left;

                //console.info(_swiper_init_position,_swiper.css('transform'));

                if(o.design_skin=='skin-darkfull' && ww>520){
                    _swiper_init_position=ww/2;
                }
                return false;
            });

            $(document).bind('mousemove', function(e){
                if(dragging==false){

                }else{
                    screen_mousex = e.screenX;
                    targetPositionX = _swiper_init_position + (screen_mousex - down_x);
//                    console.info(_swiper_init_position, screen_mousex, down_x, targetPositionX);
                    if(targetPositionX<0){
                        targetPositionX/=2;
                    }

                    if(targetPositionX>ww){
                        //console.log(targetPositionX, sw_ctw+sw_tw, (targetPositionX+sw_ctw-sw_tw)/2) ;
                        //targetPositionX/=2;


                        targetPositionX=ww+ ((targetPositionX-ww)/2);
                    }

                    scaleFactor = (1- Math.abs( (_swiper_init_position-targetPositionX) / (ww/2)));
                    scaleFactor/=0.75;
                    if(scaleFactor>1){
                        scaleFactor = 1;
                    }

                    //console.info(o.settings_transition_gallery, targetPositionX);

                    if(o.settings_transition_gallery=='slide'){

                        _swiper.css({
                            'left' : targetPositionX
                        });
                    }else{

                        _swiper.css({
                            'left' : targetPositionX
                            ,'transform' : 'scale('+scaleFactor+')'
                            ,'opacity' : scaleFactor
                        });
                    }
                }
            });


            $(document).bind('mouseup', function(e){
                //console.log(down_x);
                cthis.removeClass('closedhand');
                up_x = e.screenX;
                dragging=false;
                checkswipe();

                paused_roll=false;
                return false;
                // down_x = e.originalEvent.touches[0].pageX;
            });
            _swiper.bind('click', function(e){
                //console.log(up_x, down_x);
                if(Math.abs((down_x-up_x))>50){
                    return false;
                }
            });


            //console.log(_swiper);

            function touchstart_function(e){

                //console.info('touchstart');

                target_swiper = cthis;
                //console.info(e.originalEvent);
                down_x =  e.originalEvent.touches[0].pageX;
                dragging=true;
                paused_roll=true;


                _swiper_init_position = _swiper.offset().left - _swiper.parent().offset().left;

                //console.info(_swiper_init_position,_swiper.css('transform'));

                if(o.design_skin=='skin-darkfull' && ww>520){
                    _swiper_init_position=ww/2;
                }

                cthis.addClass('closedhand');
            }

            //var _swiper_for_events = $(document);
            var _swiper_for_events = _swiper;

            _swiper_for_events.bind('touchstart', touchstart_function);
            //addEventListener('touchstart', touchstart_function,false);
            _swiper_for_events.bind('touchmove', function(e){
                //e.preventDefault();

                if(dragging==false){

                }else{
                    screen_mousex = e.originalEvent.touches[0].pageX;
                    targetPositionX = _swiper_init_position + (screen_mousex - down_x);
//                    console.info(_swiper_init_position, screen_mousex, down_x, targetPositionX);
                    if(targetPositionX<0){
                        targetPositionX/=2;
                    }

                    if(targetPositionX>ww){
                        //console.log(targetPositionX, sw_ctw+sw_tw, (targetPositionX+sw_ctw-sw_tw)/2) ;
                        targetPositionX=ww+ ((targetPositionX-ww)/2);
                    }

                    scaleFactor = (1- Math.abs( (_swiper_init_position-targetPositionX) / (ww/2)));
                    scaleFactor/=0.75;
                    if(scaleFactor>1){
                        scaleFactor = 1;
                    }



                    if(o.settings_transition_gallery=='slide'){

                        _swiper.css({
                            'left' : targetPositionX
                        });
                    }else{

                        _swiper.css({
                            'left' : targetPositionX
                            ,'transform' : 'scale('+scaleFactor+')'
                            ,'opacity' : scaleFactor
                        });

                    }

                    return false;
                }
            });
            _swiper_for_events.bind('touchend', function(e){


                //console.log(down_x);
                cthis.removeClass('closedhand');
                //console.log(e.originalEvent);
                up_x = e.originalEvent.changedTouches[0].pageX;
                dragging=false;
                checkswipe();

                paused_roll=false;
                if(Math.abs((down_x-up_x))>50) {
                    return false;
                }
            });

            function checkswipe(){
//                    console.log(target_swiper, cthis, targetPositionX, up_x, down_x, sw_tw/5);

                //return false;
                if(typeof target_swiper=='undefined' || target_swiper!=cthis){
                    return;
                }
                var sw=false;

                if(o.settings_transition_gallery=='slide'){

                    if (up_x - down_x < -(ww/4)){
                        goto_next_galleryitem();
                        sw=true;


                        if(o.settings_transition_gallery=='slide'){

                            _swiper.animate({
                                'left' : '-100px'
                                ,'opacity' : '0'
                            },{
                                'duration': 300
                                ,'queue': false
                            });
                        }
                    }
                    if (up_x - down_x > (ww/4)){
                        goto_prev_galleryitem();
                        sw=true;


                        if(o.settings_transition_gallery=='slide'){

                            _swiper.animate({
                                'left' : '120%'
                                ,'opacity' : '0'
                            },{
                                'duration': 300
                                ,'queue': false
                            });
                        }
                    }
                }else{

                    if (up_x - down_x < -(ww/4)){
                        goto_prev_galleryitem();
                        sw=true;
                    }
                    if (up_x - down_x > (ww/4)){
                        goto_next_galleryitem();
                        sw=true;
                    }
                }



                if(sw==false){
                    if(o.settings_transition_gallery=='slide'){

                        _swiper.css({
                            'left' : ''
                        });
                    }else{

                        _swiper.css({
                            left : _swiper_init_position
                            ,'transform' : 'scale('+1+')'
                            ,'opacity' : 1
                        });

                    }

                }
                target_swiper = undefined;

                if(sw){
                    return false;
                }
            }

            function slide_left(){
                if(currPage<1){
                    _swiper.css({left : currPageX});
                    return;
                }
                gotoPrevPage();
            }
            function slide_right(){

                if(currPage>pag_total_pagenr-2){
                    _swiper.css({left : currPageX});
                    return;
                }
                gotoNextPage();
            }
        }

        function setup_paddings(){

            if(o.settings_paddingHorizontal!='default' && String(o.settings_paddingHorizontal)!='auto' && String(o.settings_paddingHorizontal).indexOf("%")==-1){
                settings_paddingHorizontal = parseInt(o.settings_paddingHorizontal, 10);
            }

            if(o.settings_paddingVertical!='default' && String(o.settings_paddingVertical)!='auto' && String(o.settings_paddingVertical).indexOf("%")==-1){
                settings_paddingVertical = parseInt(o.settings_paddingVertical, 10);
            }

            if(o.settings_paddingHorizontal=='default'){
                settings_paddingHorizontal = 100;
            }
            if(o.settings_paddingVertical=='default'){
                settings_paddingVertical = 100;
            }

            if(!isNaN(parseInt(o.design_borderwidth, 10))){
                o.design_borderwidth = parseInt(o.design_borderwidth, 10);
                width_border = parseInt(o.design_borderwidth,10);
            }
            if(o.settings_fullsize=='on'){
                settings_paddingHorizontal=0;
                settings_paddingVertical = 0;
            }
        }

        function calculateDims(){
            //console.info(o.design_skin, o.settings_paddingVertical, _holder, settings_paddingVertical);
            if(o.design_skin=='skin-nebula' && ww<481){
                width_border = 0;
                if(settings_paddingHorizontal>44){
                    settings_paddingHorizontal = 44;
                }


                if(settings_paddingVertical>44){
                    settings_paddingVertical = 44;
                }

                if(o.design_skin=='skin-nebula' && _holderText){
                    _holderText.hide();
                }
            }else{
                width_border = parseInt(o.design_borderwidth, 10);
                setup_paddings();

                if(o.design_skin=='skin-nebula' && _holderText){
                    _holderText.show();
                }
            }

            if(_holder){
                _holder.find('.zoombox-set-fullheight').each(function(){
                    var _t = $(this);

                    _t.height(wh);
                })


            }

            if (o.settings_makeFunctional == true) {
                var allowed = false; var url = document.URL; var urlStart = url.indexOf("://") + 3; var urlEnd = url.indexOf("/", urlStart); var domain = url.substring(urlStart, urlEnd);
                //console.log(domain);
                if (domain.indexOf('a') > -1 && domain.indexOf('c') > -1 && domain.indexOf('o') > -1 && domain.indexOf('l') > -1) {
                    allowed = true;
                }
                if (domain.indexOf('o') > -1 && domain.indexOf('z') > -1 && domain.indexOf('e') > -1 && domain.indexOf('h') > -1 && domain.indexOf('t') > -1) {
                    allowed = true;
                }
                if (domain.indexOf('e') > -1 && domain.indexOf('v') > -1 && domain.indexOf('n') > -1 && domain.indexOf('a') > -1 && domain.indexOf('t') > -1) {
                    allowed = true;
                }
                if (allowed == false) {
                    return;
                }

            }

            //console.info(ww, settings_paddingVertical, o.settings_paddingVertical, o.design_borderwidth);
            //console.log(_theItem, bigwidth, bigheight);
            if(_theItem!=undefined){

                iw = _theItem.width();
                ih = _theItem.height();

                if (_theItem.get(0) != undefined) {
                    if (_theItem.get(0).naturalWidth != undefined) {
                        iw = _theItem.get(0).naturalWidth;
                    }
                    if (_theItem.get(0).naturalHeight != undefined) {
                        ih = _theItem.get(0).naturalHeight;
                    }
                }

                if(typeof bigwidth!="undefined"){
                    iw = parseInt(bigwidth, 10);
                }
                if(typeof bigheight!="undefined"){
                    ih = parseInt(bigheight, 10);
                }

            }else{
                iw=400;
                ih=300;
            }


            //console.info(iw,ih);


//            console.log(_theItem, o.design_borderwidth, iw,ih, bigwidth, bigheight);

            var orig_iw = iw;
            var orig_ih = ih;

            var tw = ww - settings_paddingHorizontal;
            var th = wh - settings_paddingVertical;
            var sw_scaled = false; // ==switch to see if scaling has produced

            //console.info(dims_scaling);
//            console.info(iw,tw);
            if (iw > tw) {
                iw = tw;
                if(dims_scaling=='proportional'){
                    ih = (iw / orig_iw) * orig_ih;
                }
                sw_scaled=true;
            }

//            console.info(ih,th);
            if (ih > th) {
                ih = th;
                if(dims_scaling=='proportional'){
                    iw = (ih / orig_ih) * orig_iw;
                }
                sw_scaled=true;
                //console.log(iw, ih);
            }
//            console.info(sw_scaled, _holder);
            if(iw> o.design_borderwidth*2){

                //iw-=o.design_borderwidth*2;
            }
            if(ih> o.design_borderwidth*2){

                //ih-=o.design_borderwidth*2;
            }

            if(_conHolder!=undefined){

                if(o.settings_transition=='fromcenter'||o.settings_transition=='fade'){

                    //console.info(-iw/2,-ih/2);
                    _conHolder.css({
                        //'margin-left': -iw / 2, 'margin-top': -ih / 2, 'top': '50%', 'left': '50%'
                    })
                }
            }
            if(_holder){
                _holder.css({
                    'width': iw,
                    'height': ih
                });


                if(fullwidth){
                    _holder.width(ww);
                }
                if(fullheight){
                    _holder.height(wh);
                }
            }

            if(_holder && o.settings_zoom_doNotGoBeyond1X=='on'){
                if(sw_scaled==true){
                    if(had_zoom==true){
                        _holder.addClass('has-zoom');
                    }
                }else{
                    if(_holder.hasClass('has-zoom')){
                        had_zoom = true;
                    }
                    _holder.removeClass('has-zoom');

                }
            }
            //console.log(ww, settings_paddingVertical, ww - settings_paddingHorizontal, _theItem, iw,ih, tw);


            if(_theItem!=undefined){

                //console.info(iw,ih, fullwidth, fullheight);
                _theItem.css({
                    'width': iw,
                    'height': ih
                });
            }
            //return;
//            console.log( iw, width_border, iw+(width_border*2), ih, width_border, ih+(width_border*2));
            if(_holderBg!=undefined){
                _holderBg.css({
                    'width': iw+parseInt(width_border*2, 10)
                    ,'height': ih+(width_border*2)
                    ,'margin-left': -(iw+(width_border*2)) / 2
                    ,'margin-top': -(ih+(width_border*2))/ 2
                })
            }
            //return;


//            console.info(iw, ih);

            if(o.design_skin=='skin-nebula' && _theDivItem){
                if(_holderText){
                    _holderText.width(iw);
                    _theDivItem.css({
                        'height' : ih-32-(_holderText.eq(0).outerHeight())
                    })
                    _holderText.css({
                        'width' : 'auto'
                    });
                }
            }


            _swiper_init_position = ww/2;



            var args = {
                init_calculateDims : false
                ,resize_maincon:false
                ,apply_settings_fullsize: true
                ,zoombox_hard_resize : true
            };


            //console.info(args);
            handleResize(null, args);


            // ----- if image zoomed in
            if(_bigimageThe!=undefined){
//                console.info(_bigimageThe.get(0).naturalWidth)
                bw = ww;
                bh = (bw / orig_bw) * orig_bh;


                if(bh<wh){
                    bh = wh;
                    bw = (bh / orig_bh) * orig_bw;
                }

                var bl = 0;
                var bt = 0;


                if(o.settings_zoom_doNotGoBeyond1X=='on'){
                    binw = _bigimageThe.get(0).naturalWidth;
                    binh = _bigimageThe.get(0).naturalHeight;

//                    console.info(bw, binw, ww, bh);
                    if(bw > binw){
                        bw = binw;
                        bh = (bw / orig_bw) * orig_bh;
                        bl = (ww - binw)/2;
//                        console.info(bh, wh);
                        if(bh<wh){
                            bt = (wh - binh)/2;

                        }
                    }
//                    console.info(parseInt(bh,10), binh, wh);
                    if(parseInt(bh,10) > binh){
                        bh = binh;
                        bw = (bh / orig_bh) * orig_bw;
                        bt = (wh - binh)/2;
//                        console.info(bh, binh, wh, bt);
                    }
                }else{

                }




                if(bw>ww){
                    dir_hor = true;
                }else{
                    dir_hor = false;
                }

                if(bh>wh){
                    dir_ver = true;
                }else{
                    dir_ver = false;
                }

                if(bl<0){
                    bl=0;
                }

                _bigimageThe.css('width', bw);
                _bigimageThe.css('height', bh);
                _bigimageThe.css('left', bl);
                _bigimageThe.css('top', bt);
            }

            if(o.design_skin=='skin-whitefull' && o.settings_fullsize=='on'){
                if(ww>1000){
                    if(_holder){
                        _holder.css({
                            'top' : ''
                        })
                    }


                }else{
                }
            }
        }






        this.each(function () {
            var cthis = $(this);
            var type = 'image';


            //console.log(cthis, type);
            //if(cthi)

            readyInit();
            function readyInit() {
                if (cthis.get(0) == $('body').get(0)) {
                    return;
                }
                cthis.unbind('click');
                cthis.bind('click', click_item);
            }
            return this;
        }); // end each

    }


    window.init_zoombox = function(args){
        //console.info($('.zoombox'), window._zoombox_maincon,window.init_zoombox_settings);

        if(typeof args=='undefined'){
            if(typeof window.init_zoombox_settings!='undefined'){
                args = window.init_zoombox_settings;
            }
        }

        //console.info($('.zoombox'));
        //console.info('COMING YOUR WAY', $('.zoombox'), window._zoombox_maincon);
        if(window._zoombox_maincon!=undefined){

            $('.zoombox').zoomBox(args);
            return false;

        }else{

            $('.zoombox').zoomBox(args);
            $(document).undelegate('.zoombox-delegated','click');
            $(document).delegate('.zoombox-delegated','click', function(){
                window.dzszb_open_item($(this));

                return false;
            });
            return false;
        }

    };
})(jQuery);

jQuery.fn.urlParam = function (arg, name) {
    var results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(arg);
    return (results !== null) ? results[1] : 0;
}

function is_ios() {
    return ((navigator.platform.indexOf("iPhone") != -1) || (navigator.platform.indexOf("iPod") != -1) || (navigator.platform.indexOf("iPad") != -1)
    );
}


jQuery(document).ready(function($){
    init_zoombox();
})

function is_android() {
    //return true;
    var ua = navigator.userAgent.toLowerCase();
    return (ua.indexOf("android") > -1);
}

function is_ie() {
    if (navigator.appVersion.indexOf("MSIE") != -1) {
        return true;
    }
    ;
    return false;
};
function is_firefox() {
    if (navigator.userAgent.indexOf("Firefox") != -1) {
        return true;
    }
    ;
    return false;
};
function is_opera() {
    if (navigator.userAgent.indexOf("Opera") != -1) {
        return true;
    }
    ;
    return false;
};
function is_chrome() {
    return navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
};
function is_safari() {
    return navigator.userAgent.toLowerCase().indexOf('safari') > -1;
};
function version_ie() {
    return parseFloat(navigator.appVersion.split("MSIE")[1]);
};
function version_firefox() {
    if (/Firefox[\/\s](\d+\.\d+)/.test(navigator.userAgent)) {
        var aversion = new Number(RegExp.$1);
        return(aversion);
    }
    ;
};
function version_opera() {
    if (/Opera[\/\s](\d+\.\d+)/.test(navigator.userAgent)) {
        var aversion = new Number(RegExp.$1);
        return(aversion);
    }
    ;
};
function is_ie8() {
    if (is_ie() && version_ie() < 9) {
        return true;
    }
    return false;
}
function is_ie9() {
    if(is_ie() && version_ie() == 9) {
        return true;
    }
    return false;
}





/*
 * Author: Digital Zoom Studio
 * Product: DZS Dock
 * Website: http://digitalzoomstudio.net/
 * Portfolio: http://bit.ly/nM4R6u
 *
 * Version: 0.50
 */

(function($) {
    $.fn.dzsdock = function(o) {
        var defaults = {
            settings_slideshowTime: '5' //in seconds
            , settings_autoHeight: 'on'
            , settings_skin: 'skin-default'
            , settings_preloadall: 'on'
            , design_normalwidth: '100'
            , design_maxmultiply: '1.3'
            , design_dockrange: '150'
            , settings_callbackOnSelect: ''
            , settings_activeclass: 'active'
            , settings_startactive: ''

        }
        o = $.extend(defaults, o);

        o.design_maxmultiply = parseFloat(o.design_maxmultiply);
        o.design_dockrange = parseInt(o.design_dockrange, 10);
        o.design_normalwidth = parseInt(o.design_normalwidth, 10);
        o.settings_startactive = parseInt(o.settings_startactive, 10);

        //console.info(o.design_normalwidth);

        this.each(function() {
            var cthis = $(this);
            var cchildren = cthis.children();
            var nr_children = cthis.children('.items').children().length
                ,nr_loaded = 0
                ;
            var currNr = -1;
            var busy = true;
            var i = 0;
            var ww
                , wh
                , tw
                , th
                ;
            var busy = false;

            var totalw = 0
                ,clipw = 0
                ,mouseX=0
                ,mousey=0
                ,viewIndexX = 0
                ;
            var _items
                ;
            var int_calculate;
            var is_already_inited="off";

            init();
            function init(){
                if(cthis.attr('class').indexOf("skin-")==-1){
                    cthis.addClass(o.settings_skin);
                }
                if(cthis.hasClass('skin-default')){
                    o.settings_skin = 'skin-default';
                }

                if(cthis.children('.dzsdock-clip').length==0){
                    cthis.children('.items').wrap('<div class="dzsdock-clip"></div>')
                }
                _items = cthis.find('.items').eq(0);

                if(!isNaN(o.design_normalwidth)){
                    o.settings_preloadall = 'off';

                    _items.children().each(function(){
                        var _t = jQuery(this);
                        _t.data('originalw', o.design_normalwidth);

                        if(_t.hasClass('active')){
                            _t.css('width', o.design_maxmultiply * parseInt(_t.data('originalw'), 10));
                        }else{
                            _t.css('width', _t.data('originalw'));
                        }
                    });
                }




                if(o.settings_preloadall=='on'){
                    //console.log(cthis.find('.items').eq(0).children());
                    _items.children().each(function(){
                        var _t = $(this);
                        if(_t.get(0)!=undefined && _t.get(0).nodeName=="IMG"){
                            //console.log(_t.attr('data-thumbnail'))
                            var auxImage = new Image();
                            auxImage.src=_t.attr('src');
                            auxImage.onload=imageLoaded;
                            totalw+=7;
                        }else{
                            imageLoaded();
                        }

                    })
                    //===failsafe
                    setTimeout(handle_loaded, 7500);

                }else{
                    setTimeout(handle_loaded, 1000);
                }

            }
            function imageLoaded(e){
                nr_loaded++;
                //console.log(this, this.naturalWidth, this.naturalHeight, this.complete, nr_loaded, nr_children);
                if(nr_loaded>=nr_children){
                    //==leave some time for the width to be set in the items
                    setTimeout(handle_loaded, 1000);
                    //handle_loaded();
                }
            }
            function handle_loaded() {
                if(is_already_inited=='on'){
                    return;
                }
                if(_items.css('opacity')==0){
                    _items.css('opacity',1);
                }

                _items.children().each(function(){
                    var _t = $(this);
                    //console.log(_t.data('originalw'));
                    if(_t.data('originalw')==undefined){
                        _t.data('originalw', parseInt(_t.outerWidth(false),10));
                    }

                    //`console.log(_t.data('originalw'));
                    totalw+=_t.outerWidth(true);
                });
                //totalw+=10;
                totalw+=(o.design_maxmultiply * 2 - 2) * o.design_normalwidth;
                //console.info(totalw);

                if(!isNaN(o.settings_startactive)){
                    _items.children().eq(o.settings_startactive).addClass(o.settings_activeclass)
                }

                _items.css('width', 10000);


                cthis.bind('mousemove', handle_mousemove);
                cthis.bind('mouseleave', handle_mouseleave);


                _items.children().bind('click', click_item);


                $(window).bind('resize', handleResize);
                handleResize();
                //setTimeout(handleResize, 1000);
                is_already_inited = 'on';
            }
            function click_item(e){

                //==click item for dzs dock
                var _t = $(this);
                var ind = _t.parent().children().index(_t);
                //console.info(ind);

                //console.log(_t, _t.hasClass(o.settings_activeclass));
                if(_t.hasClass(o.settings_activeclass)){
                    return;
                }

                if(o.settings_callbackOnSelect!=''){
                    o.settings_callbackOnSelect(ind);
                }

                _t.parent().children().removeClass(o.settings_activeclass);
                _t.addClass(o.settings_activeclass);

                //return false;
            }

            function handle_mousemove(e){
                mouseX = e.pageX - cthis.offset().left;
                clearTimeout(int_calculate);
                int_calculate = setTimeout(calculate_items, 5);
            }
            function calculate_items(args){
                clipw = cthis.find('.dzsdock-clip').eq(0).width();
                //console.info(clipw);
                _items.children().each(function(){
                    var _t = $(this);
                    var tx = _t.offset().left + _t.outerWidth(false) * 0.5;
                    //console.info(_t, Math.floor(mouseX - tx), _t.outerWidth(false) * 0.5)

                    if(_t.hasClass('active')){
                        _t.css('width', o.design_maxmultiply * parseInt(_t.data('originalw'), 10));
                    }else{
                        if((args!=undefined && args.mouseisout==true) || (Math.floor(Math.abs(mouseX - tx)) > o.design_dockrange )){

                            if(parseInt(_t.css('width'),10)!=_t.data('originalw')){
                                _t.css('width', _t.data('originalw'));
                            }
                        }else{
                            //console.log(_t, tx);
                            var aux = (1- (Math.floor(Math.abs(mouseX - tx))) / o.design_dockrange);

                            //console.info(_t, ';;;;',  (Math.floor(Math.abs(mouseX - tx))), ';;;;', aux);
                            var auxw = aux * (parseInt(_t.data('originalw'), 10)* o.design_maxmultiply - parseInt(_t.data('originalw'), 10)) + parseInt(_t.data('originalw'), 10);
                            //console.log(_t, (_t.data('originalw')), auxw);
                            if(auxw > o.design_maxmultiply * parseInt(_t.data('originalw'), 10)){
                                auxw = o.design_maxmultiply * parseInt(_t.data('originalw'), 10);
                            }
                            _t.css('width', auxw);
                            if(_t.get(0)!=undefined && _t.get(0).nodeName=="IMG"){
                                //totalw+=15 * o.design_maxmultiply;
                            }

                        }
                    }

                    //totalw+=_t.outerWidth(true);
                });

                if(args!=undefined && args.donotmove==true){

                }else{
                    //console.log(totalw, clipw);
                    if(totalw > clipw){
                        var aux = mouseX / clipw;
                        //console.info(aux);
                        viewIndexX= -(aux*(totalw-clipw));
                        //console.info(viewIndexX);
                        _items.css('left', parseInt(viewIndexX,10));
                    }

                }
                if(totalw < clipw){
                    _items.css('left', (clipw - totalw) / 2);
                }
                //totalw+=100;
                //totalw+=(o.design_maxmultiply * 2 - 2) * o.design_normalwidth;

                //console.info(totalw);
                //_items.css('width', totalw);
                _items.css('width', 10000);
                //console.info(mouseX);
            }
            function handle_mouseleave(e){
                mouseX = 10000;
                calculate_items({donotmove:true});
            }
            function handleResize() {
                ww = $(window).width();

                calculate_items({donotmove:true, mouseisout: true});
            }
            return this;
        })
    }
})(jQuery);


window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame       ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        function( callback ){
            window.setTimeout(callback, 1000 / 60);
        };
})();


function get_query_arg(purl, key){
    if(purl.indexOf(key+'=')>-1){
        //faconsole.log('testtt');
        var regexS = "[?&]"+key + "=.+";
        var regex = new RegExp(regexS);
        var regtest = regex.exec(purl);
        //console.info(regtest);

        if(regtest != null){
            var splitterS = regtest[0];
            if(splitterS.indexOf('&')>-1){
                var aux = splitterS.split('&');
                splitterS = aux[1];
            }
            //console.log(splitterS);
            var splitter = splitterS.split('=');
            //console.log(splitter[1]);
            //var tempNr = ;

            return splitter[1];

        }
        //$('.zoombox').eq
    }
}


function add_query_arg(purl, key,value){
    key = encodeURIComponent(key); value = encodeURIComponent(value);

    //if(window.console) { console.info(key, value); };

    var s = purl;
    var pair = key+"="+value;

    var r = new RegExp("(&|\\?)"+key+"=[^\&]*");


    //console.info(pair);

    s = s.replace(r,"$1"+pair);
    //console.log(s, pair);
    var addition = '';
    if(s.indexOf(key + '=')>-1){


    }else{
        if(s.indexOf('?')>-1){
            addition = '&'+pair;
        }else{
            addition='?'+pair;
        }
        s+=addition;
    }

    //if value NaN we remove this field from the url
    if(value=='NaN'){
        var regex_attr = new RegExp('[\?|\&]'+key+'='+value);
        s=s.replace(regex_attr, '');
    }


    //if(!RegExp.$1) {s += (s.length>0 ? '&' : '?') + kvp;};

    return s;
}
function has_history_api() {
    return !!(window.history && history.pushState);
}
jQuery(document).ready(function($){

    $('.effect-icona').each(function(){
        var _t = $(this);
        _t.append('<div class="zoomcon-enlarge"></div>')
    })
    $('.effect-icona-playbtn').each(function(){
        var _t = $(this);
        _t.append('<div class="zoomcon-enlarge"></div>')
    })
})