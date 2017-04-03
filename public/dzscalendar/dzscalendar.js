
/*
 * Author: Digital Zoom Studio
 * Website: http://digitalzoomstudio.net/
 * Portfolio: http://codecanyon.net/user/ZoomIt/portfolio
 *
 * Version: 3.93
 */


if(window.jQuery==undefined){
    alert("dzscalendar.js -> jQuery is not defined or improperly declared ( must be included at the start of the head tag ), you need jQuery for this plugin");
}
var settings_dzscalendar = { animation_time: 500, animation_easing:'swing' };

function is_ios() {
    return ((navigator.platform.indexOf("iPhone") != -1) || (navigator.platform.indexOf("iPod") != -1) || (navigator.platform.indexOf("iPad") != -1)
    );
}
function is_android() {
    //return true;
    return (navigator.platform.indexOf("Android") != -1);
}

function is_ie(){
    if (navigator.appVersion.indexOf("MSIE") != -1){
        return true;
    };
    return false;
};
function is_firefox(){
    if (navigator.userAgent.indexOf("Firefox") != -1){
        return true;
    };
    return false;
};
function is_opera(){
    if (navigator.userAgent.indexOf("Opera") != -1){
        return true;
    };
    return false;
};
function is_chrome(){
    return navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
};
function is_safari(){
    return navigator.userAgent.toLowerCase().indexOf('safari') > -1;
};
function version_ie(){
    return parseFloat(navigator.appVersion.split("MSIE")[1]);
};
function version_firefox(){
    if (/Firefox[\/\s](\d+\.\d+)/.test(navigator.userAgent)){
        var aversion=new Number(RegExp.$1);
        return(aversion);
    };
};
function version_opera(){
    if (/Opera[\/\s](\d+\.\d+)/.test(navigator.userAgent)){
        var aversion=new Number(RegExp.$1);
        return(aversion);
    };
};
function is_ie8(){
    if(is_ie()==true && version_ie() < 9){
        return true;
    }
    return false;
}


var _MS_PER_DAY = 1000 * 60 * 60 * 24;

window.dzscal_event_id_ind = 1;

// a and b are javascript Date objects
function dateDiffInDays(a, b) {
    // Discard the time and time-zone information.
    var utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    var utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

    return Math.floor((utc2 - utc1) / _MS_PER_DAY);
}


var dzstlt_arr_tooltips = [];

window.dzscal_autooptions = {};
(function($) {

    $.fn.dzscalendar = function(o) {

        var defaults = {
            settings_slideshowTime : '5' // --- in seconds
            ,mode: 'normal' // ---- normal or datepicker or blogevents
            , settings_autoHeight : 'on'
            , settings_skin : 'skin-default'
            , start_month : ''
            , start_year : ''
            , start_day : ''
            , start_weekday : '星期一' // ---- Sunday or Monday
            , design_transition: 'default' // ---- default ( based on skin ) or slide or fade
            , design_transitionDesc: 'tooltipDef' // ---- the event transition - tooltipDef or slide or showContent
            ,header_weekdayStyle: 'default' // --- default, three, full
            ,settings_alwaysinclude6rows: 'default' // --- 6 rows is the max
            ,mode_datepicker_setTodayAsDefault: 'off' // --- off or on
            ,mode_blogevents_container: '.content' // --- select a dom elements in which the event to appear
            ,mode_blogevents_defaultaction: 'none' // --- select none or today to illustrate the default event
            ,mode_blogevents_clickNonEventTriggersDefaultContent: 'off' // --- selecting on triggers all dates to be clickable
            ,settings_makeFunctional: false
            ,date_format:'j-n-Y'
            ,settings_tooltipalwaysleft : 'off' // -- if set to on the tooltip will always come left
            ,design_month_covers: [
                'apod-images/2017-02-07.jpg', 'apod-images/2017-02-08.jpg', 'apod-images/2017-02-09.jpg',
                'apod-images/2017-02-10.jpg', 'apod-images/2017-02-11.jpg', 'apod-images/2017-02-12.jpg',
                'apod-images/2017-02-13.jpg', 'apod-images/2017-02-14.jpg', 'apod-images/2017-02-15.jpg',
                'apod-images/2017-02-16.jpg', 'apod-images/2017-02-17.jpg', 'apod-images/2017-02-18.jpg'
            ]
            ,action_mode_datepicker_select_day : null
        };

        if(typeof o =='undefined'){
            if(typeof $(this).attr('data-options')!='undefined'  && $(this).attr('data-options')!=''){
                var aux = $(this).attr('data-options');
                aux = 'window.dzscal_autooptions = ' + aux;
                eval(aux);
                o = $.extend(o, window.dzscal_autooptions);
                window.dzscal_autooptions = $.extend({},{});
            }
        }


        o = $.extend(defaults, o);
        this.each( function(){
            var cthis = $(this);
            var cclass = '';
            var tw
                ,th
                ;
            var cchildren = cthis.children();
            var currNr=-1
                ,currMon=0
                ,currYear=0
                ,_currTable
                ,currHeight
                ,currWidth
                ,_calendarControls
                ,currDesc
                ,_argTable
                ,_auxTransition
                ,_theMonths
                ,busy = false
                ,forward=false
                ,transitioned = false // == transition started
                ,_mode_datepicker_targetField = null
                ;
            var _c;
            var timebuf=0
                ,skin_tableWidth = 182
                ,skin_normalHeight = 138
                ,odd_decider = 0 //-- a decider for skin-lions to mark odd columns
                ,start_month
                ,start_year
                ,start_day
                ;
            var slideshowTime = parseInt(o.settings_slideshowTime);
            var i=0, j=0, k=0;
            var theMonths
                ,theControls
                ,_currDate
                ;
            var events = [];
            var now
                ,dat
                ;
            var posX, posY, origH='auto';
            var arr_monthnames = [ "一月", "二月", "三月", "四月", "五月", "六月",
                "七月", "八月", "九月", "十月", "十一月", "十二月" ];
            var arr_weekdays = ['日', '一', '二', '三', '四', '五', '六'];
            var inter_hidetooltips;


            var _tooltip = null;

            var blogevents_orightml = 'unset';


            // console.info(cthis, o);

            if(typeof(window.arr_weekdays)=='object' && window.arr_weekdays.length > 1){
                arr_weekdays = window.arr_weekdays;
            }


            if(typeof(window.arr_monthnames)=='object' && window.arr_monthnames.length > 1){
                arr_monthnames = window.arr_monthnames;
            }

            if(o.start_month){                start_month = o.start_month;            }

            if(o.start_day){                start_day = o.start_day;            }

            if(o.start_year){                start_year = o.start_year; }
            //console.info(typeof(window.arr_weekdays));

            init();

            function init(){
                // cchildren.eq(0).css('position', 'absolute');

                if(typeof(cthis.attr('class')) == 'string'){
                    cclass = cthis.attr('class');
                }else{
                    cclass=cthis.get(0).className;
                }

                if(cclass.indexOf("skin-")==-1){
                    cthis.addClass(o.settings_skin);
                }else{

                    if(cthis.hasClass('skin-default')){
                        o.settings_skin = 'skin-default';
                    }
                    if(cthis.hasClass('skin-black')){
                        o.settings_skin = 'skin-black';
                    }
                    if(cthis.hasClass('skin-aurora')){
                        o.settings_skin = 'skin-aurora';
                    }

                    if(cthis.hasClass('skin-responsive')){
                        o.settings_skin = 'skin-responsive';
                    }
                    if(cthis.hasClass('skin-responsive-galileo')){
                        o.settings_skin = 'skin-responsive-galileo';
                    }
                    if(cthis.hasClass('skin-lions')){
                        o.settings_skin = 'skin-lions';
                    }
                    if(cthis.hasClass('skin-lions-square')){
                        o.settings_skin = 'skin-lions-square';
                    }
                }

                cthis.addClass('mode-'+ o.mode);
                cthis.addClass('tooltip_transition-'+ o.design_transitionDesc);

                if(o.settings_skin=='skin-black'){

                    skin_tableWidth = 192;
                    skin_normalHeight = 158;
                    tw = 192; th = 158;
                }

                if(o.settings_skin=='skin-aurora'){
                    tw = 212;
                    th = 220;
                }
                if(o.settings_skin=='skin-responsive-galileo'){

                    if(o.design_transition=='default'){
                        o.design_transition = 'slide3d';
                    }
                    if(o.header_weekdayStyle=='default'){
                        o.header_weekdayStyle = 'responsivefull';
                    }
                }
                if(o.settings_skin=='skin-lions' || o.settings_skin=='skin-lions-square'){

                    if(o.header_weekdayStyle=='default'){
                        o.header_weekdayStyle = 'responsivefull';
                    }
                }



                if(o.design_transitionDesc=='default'){
                    o.design_transitionDesc = 'tooltipDef';
                }
                if(o.design_transition=='default'){
                    o.design_transition = 'slide';
                }
                if(o.design_transition=='slide3d'){
                    //o.settings_alwaysinclude6rows = 'on';
                }



                now = new Date();

                //console.info(o);
                //console.log(now, now.getFullYear(), now.getDate());

                reinit();

                //==constructing in progress...
                cthis.append('<div class="calendar-controls">' + '<div class="curr-date"><span class="curr-month">' + ''+arr_monthnames[now.getMonth()]+'</span><span class="curr-year">'+now.getFullYear()+'</span></div>' + '<div class="arrow-left"></div><div class="arrow-right"></div>' + '</div>');

                cthis.append('<div class="theMonths"></div>');
                _currDate = cthis.find('.curr-date');

                _theMonths = cthis.children('.theMonths');
                theControls = cthis.children('.calendar-controls');
                _calendarControls = theControls;


                if(cthis.hasClass('skin-lions') || cthis.hasClass('skin-lions-square')){
                    _calendarControls.find('.arrow-left').eq(0).append('<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="14.5px" height="17.991px" viewBox="0 0 14.5 17.991" enable-background="new 0 0 14.5 17.991" xml:space="preserve"> <path fill="#222222" d="M12.638,2.567c0-0.193-0.071-0.361-0.212-0.502l-1.853-1.853C10.432,0.071,10.265,0,10.072,0 C9.878,0,9.71,0.071,9.569,0.212L1.288,8.493C1.146,8.635,1.076,8.802,1.076,8.996c0,0.193,0.071,0.361,0.212,0.502l8.281,8.281 c0.141,0.141,0.309,0.212,0.502,0.212c0.193,0,0.361-0.071,0.502-0.212l1.853-1.853c0.141-0.141,0.212-0.309,0.212-0.502 c0-0.193-0.071-0.361-0.212-0.502L6.5,8.996l5.926-5.927C12.568,2.928,12.638,2.76,12.638,2.567z"/> </svg>');
                    _calendarControls.find('.arrow-right').eq(0).append('<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="14.5px" height="17.991px" viewBox="0 0 14.5 17.991" enable-background="new 0 0 14.5 17.991" xml:space="preserve"> <path fill="#222222" d="M1.486,15.41c0,0.193,0.071,0.36,0.211,0.5l1.847,1.848c0.141,0.141,0.308,0.211,0.501,0.211 c0.193,0,0.36-0.07,0.501-0.211l8.257-8.257C12.944,9.359,13.014,9.193,13.014,9s-0.07-0.36-0.211-0.5L4.546,0.243 C4.405,0.102,4.238,0.031,4.045,0.031c-0.193,0-0.36,0.07-0.501,0.211L1.697,2.09C1.556,2.23,1.486,2.397,1.486,2.591 c0,0.192,0.071,0.359,0.211,0.5L7.606,9l-5.909,5.909C1.556,15.05,1.486,15.216,1.486,15.41z"/> </svg>');
                }

                if(o.design_transitionDesc=='slide'){
                    //_theMonths.css({'overflow': 'hidden'})
                }


                if(o.design_transition=='slide3d'){
                    _calendarControls.prepend('<div class="month-bg"></div>');
                }

                //var auxMout = auxWeekRow + auxWeekRow + auxWeekRow + auxWeekRow + auxWeekRow + auxWeekRow;

                //_theMonths.find('.mon-body').append('')
                //setInterval(tick, 1000);
                //gotoItem(0);


                cthis.get(0).arr_datepicker_events = [];
                cthis.get(0).api_reinit = reinit;
                cthis.get(0).gotoItem = gotoItem;
                cthis.get(0).api_datepicker_click_day = datepicker_click_day;

                cthis.find('.arrow-left').click(click_arrow_left);
                cthis.find('.arrow-right').click(click_arrow_right);
//                $(document).undelegate('.hasEvent', 'click');

                //console.info(cthis, o.design_transitionDesc)


                $(document).delegate('.dzscalendar .hasEvent', 'click', click_event);
                $(document).delegate('.dzscalendar .hasEventForHover', 'click', click_event);

                if(o.mode=='datepicker' || (o.mode == 'blogevents' && o.mode_blogevents_clickNonEventTriggersDefaultContent=='on')){

                    $(document).undelegate('.dzscalendar .mon-body .week-day', 'click');
                    $(document).delegate('.dzscalendar .mon-body .week-day', 'click', datepicker_click_day);
                }


                //cthis.find().live('click', );



                currMon = now.getMonth();
                currYear = now.getFullYear();



                if(o.mode=='blogevents'){
                    if(get_query_arg(window.location.href, 'dzscal_date')!=undefined){
                        var auxhref = get_query_arg(window.location.href, 'dzscal_date');
                        var auxhrefs = String(auxhref).split('-');
                        if(auxhrefs[0]){
                            start_month = auxhrefs[0];
                        }
                        if(auxhrefs[1]){
                            start_day = auxhrefs[1];
                        }
                        if(auxhrefs[2]){
                            start_year = auxhrefs[2];
                        }
                    }else{
                        if(o.mode_blogevents_defaultaction=='today'){
//                            console.info(now, now.getDate(), now.getMonth(), now.getFullYear());


                            start_month = now.getMonth()+1;
                            start_day = now.getDate();
                            start_year = now.getFullYear();
                        }
                    }
                }

                if(start_year){
                    currYear = parseInt(start_year, 10);
                }
                if(start_month){
                    currMon = parseInt(start_month, 10);
                    currMon--;
                }
//                console.log(currYear, currMon, o.start_month);





                gotoItem(currYear, currMon);
                //_currTable = _theMonths.children('.argTable');
                //_argTable = _currTable;

                //console.info(_theMonths,_currTable)


                if(start_day && o.mode=='blogevents'){
                    start_day = parseInt(start_day,10)-1;
                    if(isNaN(start_day)==false){
                        _theMonths.find('.curr-months-date').eq(start_day).trigger('click');
                        if(_theMonths.find('.curr-months-date').eq(start_day).hasClass('hasEvent')==false){

                            $(o.mode_blogevents_container).html("No events for today. You can see upcoming events in the calendar to the right.");
                            $(o.mode_blogevents_container).addClass('active');
                        }
                    }
                }

                if(o.design_transition=='slide3d'){
                    the_transition_complete();
                }

                if(o.design_transitionDesc=='showContent'){
                    //cthis.delegate('.week-day', 'hover')
                }

                //$(window).bind('click', click_window);
                $(window).bind('resize', handle_resize);
                handle_resize();
                setTimeout(function(){ handle_resize(); }, 500);

                /*

                 if(cclass.indexOf("responsive")==-1){
                 cthis.css('height', cthis.height()); origH = cthis.height();
                 }else{
                 }
                 */
                //console.log(origH);

            }

            function reinit(){

                for(i=0;i<cthis.children('.events').children().length;i++){
                    _c = cthis.children('.events').children().eq(i);
                    events[i] = ({date: _c.attr('data-date'), startdate: _c.attr('data-startdate'),enddate: _c.attr('data-enddate'), content: _c.html(), repeat: _c.attr('data-repeat'), day: parseInt(_c.attr('data-day'),10), month: parseInt(_c.attr('data-month'),10), year: _c.attr('data-year'), startday: _c.attr('data-startday'), endday: _c.attr('data-endday'), type: _c.attr('data-type'), href: _c.attr('data-href'), tag: _c.attr('data-tag'), eventbg: _c.attr('data-eventbg'), event_inner: '', open_in_zoombox: 'off'  });

                    //console.info(_c, _c.children('.event-inner'))
                    if(_c.children('.event-inner').length>0) {
                        events[i].event_inner = _c.children('.event-inner').html();
                    }
                    if(_c.hasClass('open-in-zoombox') ){
                        events[i].open_in_zoombox = 'on';


                        if(_c.attr('data-bigwidth')){
                            events[i].zoombox_big_width = _c.attr('data-bigwidth');
                        }
                        if(_c.attr('data-bigheight')){
                            events[i].zoombox_big_height = _c.attr('data-bigheight');
                        }
                        if(_c.attr('data-scaling')){
                            events[i].zoombox_scaling = _c.attr('data-scaling');
                        }
                    }
                }




                cthis.children('.events').remove();

                //console.info(events);
                //console.warn(cthis);


                if(cthis.parent().find('.date-picker-target-field').eq(0).length>0){
                    _mode_datepicker_targetField = cthis.parent().find('.date-picker-target-field').eq(0);
                }
                if(cthis.parent().find('input[type=text]').eq(0).length>0){
                    _mode_datepicker_targetField = cthis.parent().find('input[type=text]').eq(0);
                }


                // console.info(cthis, _mode_datepicker_targetField);

                if(_mode_datepicker_targetField && _mode_datepicker_targetField.val()!=''){

                    var regexr = /\w+/g;

                    var aux2 = [];
                    var aux_str_


                    var aux_m_ind = 0;
                    var aux_d_ind = 1;
                    var aux_m_ind = 2;

                    var aux_m_str = ''
                        ,aux_d_str = ''
                        ,aux_y_str = ''
                        ;


                    var final_start_date = 'm-d-y';


                    var regexr_ind = 0;
                    while(aux2 = regexr.exec(String(o.date_format))){

                        //console.info(aux2[0]);

                        if(aux2[0]=='j'){
                            aux_d_ind = regexr_ind;
                            aux_d_str = aux2[0];
                        }
                        if(aux2[0]=='F'||aux2[0]=='n'){
                            aux_m_ind = regexr_ind;
                            aux_m_str = aux2[0];
                        }
                        if(aux2[0]=='y'||aux2[0]=='Y'){
                            aux_y_ind = regexr_ind;
                            aux_y_str = aux2[0];
                        }

                        regexr_ind++;
                    }

                    //console.info(aux_m_ind,aux_d_ind,aux_y_ind,aux_m_str,aux_d_str,aux_y_str);

                    regexr.lastIndex=0;


                    regexr_ind = 0;
                    while(aux2 = regexr.exec(String(_mode_datepicker_targetField.val()))){


                        //console.info(final_a);
                        var final_a = '';

                        if(regexr_ind===aux_d_ind){
                            if(aux_d_str=='j'){
                                final_a = aux2[0];
                            }

                            if(final_a){
                                start_day = final_a;
                            }
                            final_start_date = final_start_date.replace('d',final_a);
                        }
                        if(regexr_ind===aux_m_ind){
                            if(aux_m_str=='n'){
                                final_a = aux2[0];
                            }
                            if(aux_m_str=='F'){
                                for(i=0;i<arr_monthnames.length;i++){
                                    //console.log(arr_monthnames[i]);
                                    if(aux2[0]===arr_monthnames[i]){
                                        final_a = i+1;
                                        break;
                                    }
                                }
                            }
                            if(final_a){
                                currMon = final_a;
                                start_month = final_a;
                            }
                            final_start_date = final_start_date.replace('m',final_a);
                        }
                        if(regexr_ind===aux_y_ind){
                            if(aux_y_str=='Y'){
                                final_a = aux2[0];
                            }
                            if(final_a){
                                currYear = final_a;
                                start_year = final_a;
                            }
                            final_start_date = final_start_date.replace('y',final_a);
                        }

                        regexr_ind++;
                    }
                    //console.info(final_start_date);

                }else{

                    if(o.mode_datepicker_setTodayAsDefault=='on'){
                        start_day = now.getDate();
                        start_month = now.getMonth()+1;
                        start_year = now.getFullYear();
                    }
                }

                //console.info(currYear, currMon);
                if(_theMonths!=undefined){
                    gotoItem(currYear, currMon);
                }

            }


            function datepicker_click_day(e,arg_t){
                // console.log('datepicker_click_day');
                var _t = $(this);
                //console.log(cthis, _t, _t.attr('data-date'), _mode_datepicker_targetField);

                if(!e){
                    if(arg_t){
                        _t = arg_t;
                    }
                }

                //console.log(cthis, _t, _t.attr('data-date'), _mode_datepicker_targetField, cthis.has(_t), $.contains(cthis.get(0), _t.get(0)), $.contains(document.getElementById("calendar_datepicker"), _t.get(0)));




                //if(cthis.has(_t).length==0){
                //    return;
                //}

                if($.contains(cthis.get(0), _t.get(0))==false){


                    //console.warn(_t.parent().parent().parent().parent().parent());
                    if(_t.parent().parent().parent().parent().parent().hasClass('dzscalendar')){
                       _t.parent().parent().parent().parent().parent().get(0).api_datepicker_click_day(null, _t);
                    }
                    return false;
                }


                if(_t.hasClass('other-months-date')){
                    return false;
                }


                //console.log(o.mode, o.mode_blogevents_clickNonEventTriggersDefaultContent, blogevents_orightml)
                if(o.mode == 'blogevents' && o.mode_blogevents_clickNonEventTriggersDefaultContent=='on' && blogevents_orightml!='unset'){

                    // && _t.hasClass('hasEvent')==false

                    $(o.mode_blogevents_container).html(blogevents_orightml);

                    return false;
                }



                var auxa = String(_t.attr('data-date')).split('-');

                var aux_m = auxa[0]; var aux_d = auxa[1]; var aux_yyyy = auxa[2];

                var auxfout = '';


                auxfout = o.date_format;

                auxfout = auxfout.replace('j',aux_d);
                auxfout = auxfout.replace('n',aux_m);
                auxfout = auxfout.replace('F',arr_monthnames[aux_m-1]);
                auxfout = auxfout.replace('Y',aux_yyyy);




                for(i=0;i<cthis.get(0).arr_datepicker_events.length;i++){
                    //console.log(i, Array(cthis.get(0).arr_datepicker_events), Array(cthis.get(0).arr_datepicker_events).length);
                    cthis.get(0).arr_datepicker_events[i](auxfout);
                }


                _theMonths.find('.week-day').removeClass(' datepicker-selected');
                _t.addClass(' datepicker-selected');

                start_day = '';




                if(_mode_datepicker_targetField){



                    //console.info(aux_m, aux_d, aux_yyyy);
                    //console.info(_mode_datepicker_targetField, auxfout, _t.attr('data-date'));

                    _mode_datepicker_targetField.val(auxfout);
                }

            }
            function handle_resize(){


                if (o.settings_makeFunctional == true) {
                    var allowed = false;

                    var url = document.URL;
                    var urlStart = url.indexOf("://") + 3;
                    var urlEnd = url.indexOf("/", urlStart);
                    var domain = url.substring(urlStart, urlEnd);
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

                tw = cthis.width();
                cthis.removeClass('under-240 under-480');
                while(1){
                    if(tw<=240){
                        cthis.addClass('under-240');
                        break;
                    }
                    if(tw<=480){
                        cthis.addClass('under-480');
                        break;
                    }
                    break;
                }


                var auxdays = '';

                // console.info(cthis, o.header_weekdayStyle, arr_weekdays);
                if(o.header_weekdayStyle=='responsivefull'){
                    var weekDays = [];
                    for(i=0;i<arr_weekdays.length;i++){

                        var aux = arr_weekdays[i];
                        weekDays[i] = aux;
                    }
                    if(cthis.hasClass('under-480')){
                        for(i=0;i<arr_weekdays.length;i++){
                            var aux = arr_weekdays[i].substr(0,3);
                            weekDays[i] = aux;
                        }

                    }
                    if(cthis.hasClass('under-240')){
                        for(i=0;i<arr_weekdays.length;i++){
                            var aux = arr_weekdays[i].substr(0,1);
                            weekDays[i] = aux;
                        }
                    }




                    var startindex = 0;
                    if(o.start_weekday=='星期一'){
                        startindex = 1;
                    }


                    for(i=startindex;i<arr_weekdays.length;i++){
                        auxdays+='<span class="week-day week-day-header';
                        odd_decider++; if(odd_decider%2==1){
                            auxdays+=' odd';
                        }
                        auxdays+='">' + weekDays[i] + '</span>';
                    }
                    for(i=0;i<startindex;i++){
                        auxdays+='<span class="week-day week-day-header';

                        auxdays+='">' + weekDays[i] + '</span>';
                    }


                    cthis.find('.headerRow').html(auxdays);



                }

                if(cthis.hasClass('skin-lions') || cthis.hasClass('skin-lions-square')){
                    odd_decider=0;
                    _theMonths.find('.week-day').each(function(){
                        var _t = $(this);

                        odd_decider++;
                        if(odd_decider%2==1){
                            _t.addClass('odd');
                        }else{
                            _t.removeClass('odd');

                        }
                        //console.info(tw/7,(4*6/7),tw/7-(4*6/7));

                        _t.outerWidth(tw/7-(4*6/7));

                        if(_t.parent().parent().hasClass('mon-body') || cthis.hasClass('skin-lions-square')){
                            _t.outerHeight(tw/7-(4*6/7));
                        }

                    })
                }


                //console.info(_currTable, _argTable);
                if(o.settings_autoHeight=='on' && _argTable){
                    //console.info(_currTable, _currTable.height())
                    _theMonths.animate({
                        'height' : _argTable.height()
                    },{queue:false, complete: function(){
                        var _t = $(this);

                        setTimeout(function(){

                            _theMonths.css('overflow','');;
                        },100)
                    }})
                }



            }
            function hide_tooltips(){
                //console.log(currNr, o.design_transitionDesc);
                cthis.find('.openTooltip').each(function(){
                    var _t2 = $(this);
                    _t2.removeClass('openTooltip');
                })
                //cthis.find('.currTooltip').each(function(){
                //    var _t2 = $(this);
                //    _t2.removeClass('currTooltip');
                //})
                //if(o.design_transitionDesc=='tooltipDef'){
                //
                //    cthis.find('.dzstooltip').each(function(){
                //        var _t2 = $(this);
                //        _t2.removeClass('active');
                //
                //    })
                //}


                cthis.css('height', origH);
            }
            function click_window(e){
                //console.info('click_window', e.target)
                hide_tooltips();
            }
            function click_event(e){
                var _t = $(this);
                console.log('click_event', cthis, _t);
                if(cthis.has(_t).length==0){
                    return;
                }
//                console.log(cthis, _t);
                if(_t.hasClass("desc-close-button")){


                    if(o.design_transitionDesc=='slide'){
                        currDesc.animate({'top' : -skin_normalHeight}
                            ,{queue:false, duration:settings_dzscalendar.animation_time/1.5, easing:settings_dzscalendar.animation_easing})
                        theControls.animate({'top' : 0}
                            ,{queue:false, duration:settings_dzscalendar.animation_time/1.5, easing:settings_dzscalendar.animation_easing})
                        _theMonths.animate({'top' : 0}
                            ,{queue:false, duration:settings_dzscalendar.animation_time/1.5, easing:settings_dzscalendar.animation_easing})


                        cthis.removeClass('description-opened')
                        return;
                    }
                    return;


                }
                //return;
                //console.log(events);

//                console.info(_t.hasClass('openTooltip'));
                if(o.design_transitionDesc=='tooltipDef'){
                    hide_tooltips();
                }

//                clearTimeout(inter_hidetooltips);


                var date = _t.attr('data-date');
                var date_y = _t.attr('data-year');
                var date_m = _t.attr('data-month');
                var date_d = _t.attr('data-day');
                var _par = _t.parent().parent().parent().parent().parent();
                k=0;

                var cont = '';

                //===========================
                //==== checking all event array for a match with the clicked day.
                var k =0;
                var swevent = false;



                cont = _t.children('.the-event-content').html();



                if(o.mode=='blogevents'){
//                    console.info(o.mode, cont, _t);
                    var stateObj = { foo: "bar" };

                    var newurl = '';
                    newurl=window.location.href;
                    newurl=add_query_arg(newurl, 'dzscal_date', _t.attr('data-date'));

//                    alert(can_history_api());
//                    console.info(newurl);
                    if((is_ie() && version_ie()<=9) || can_history_api()){

                        if((is_ie() && version_ie()<=9)==false){
                            history.pushState(stateObj, "Gallery Video", newurl);
                        }

                        //console.log('ceva',blogevents_orightml);
                        if(blogevents_orightml=='unset'){
                            blogevents_orightml = $(o.mode_blogevents_container).html();
                        }
                        //console.log('ceva',blogevents_orightml);
                        $(o.mode_blogevents_container).html(cont);
                        $(o.mode_blogevents_container).addClass('active');
                    }else{
                        window.location.href = newurl;
                    }



                    return false;
                }

                //console.log(cont);
                if(e!=undefined){
                    if(e.type=='click'){
                        if(_t.attr('data-link')){
                            window.open(_t.attr('data-link'),'_self','');


                        }
                    }
                }

                if(cont==''){
                    return;
                }


                cthis.find('.openTooltip').removeClass('openTooltip');
                _t.addClass('openTooltip');

                var tt_w = 320;
                var dir='arrow-left';

                posX = _t.offset().left - _par.offset().left + _t.outerWidth();
                posY = _t.offset().top - _par.offset().top;

                if(o.settings_skin=='skin-responsive-galileo'){
                    posY+=9;
                }


                //===if the position left is to far to the right then let the tooltip come from the left
                if(o.settings_tooltipalwaysleft=='on' || posX + tt_w > $(window).width()){
                    dir='arrow-right';
                    posX = _t.offset().left - _par.offset().left - _t.outerWidth() - tt_w;
                }

                //console.log(_t, _t.);
                //console.log(_t, _par, _t.offset().top, _par.offset().top, k, date, _calendarControls.outerHeight(), posY);

                //console.log(o.design_transitionDesc);
                if(o.design_transitionDesc=='slide'){
                    //console.log(cthis);
                    //cthis.css({'overflow' : 'hidden'});

                    setTimeout(function(){

                        cthis.addClass('description-opened')
                    },200)
                    cthis.append('<div class="currDesc slideDescription" style=""><div class="slideDescription--inner"></div></div>');
                    currDesc = cthis.find('.currDesc .slideDescription--inner').eq(0);
                    currDesc.html(cont);
                    currDesc.append('<div class="desc-close-button">x</div>')
                    currDesc.css({'top' : -skin_normalHeight, 'width' : skin_tableWidth})
                    currDesc.children('div').css({'width' : 'auto'})
                    currDesc.animate({'top' : 0}
                        ,{queue:false, duration:settings_dzscalendar.animation_time/1.5, easing:settings_dzscalendar.animation_easing})
                    theControls.animate({'top' : th + 20}
                        ,{queue:false, duration:settings_dzscalendar.animation_time/1.5, easing:settings_dzscalendar.animation_easing})
                    _theMonths.animate({'top' : th + 20}
                        ,{queue:false, duration:settings_dzscalendar.animation_time/1.5, easing:settings_dzscalendar.animation_easing})
                    currDesc.children('.desc-close-button').bind('click', click_event);
                }

                //console.log(ttip);

                // return false;

            }
            function complete_removeTooltips(){
                if(o.design_transitionDesc=='tooltipDef'){
                    cthis.find('.dzstooltip').each(function(){
                        var _t3 = $(this);

                        if(_t3.hasClass('currTooltip')==false){
                            _t3.remove();
                        }
                    })
                }
            }
            function tick(){
                timebuf++;
                if(timebuf>slideshowTime){
                    timebuf=0;
                    gotoNext();
                }
            }
            function click_arrow_left(){
                var auxMon = currMon - 1;
                var auxYear = currYear;
                if(auxMon == -1){
                    auxMon = 11;
                    auxYear--;
                }
                gotoItem(auxYear, auxMon);
            }
            function click_arrow_right(){
                var auxMon = currMon + 1;
                var auxYear = currYear;
                if(auxMon == 12){
                    auxMon = 0;
                    auxYear++;
                }
                gotoItem(auxYear, auxMon);
            }
            function gotoNext(){
                var aux=currNr+1;
                if(aux>cchildren.length-1){
                    aux=0;
                }
                gotoItem(aux);
            }
            function daysInMonth(y,m) {
                return new Date(y, m, 0).getDate();
            }


            function event_close_all_tooltips(){
                // console.info('event_close_all_tooltips()');

                // console.info(_theMonths,_argTable, _argTable.find('.weekday'));

                _argTable.find('.dzstooltip').removeClass('active');
                _argTable.find('.week-day').removeClass('tooltip-is-active');
            }

            //function
            function gotoItem(arg1, arg2){
                /// ---- go to the month, arg1 - year, arg2 - month

                //console.log('gotoItem', arg1,arg2);

                var themisc=window.cev2;
                if(themisc=='ceva'){
                    var allowed=false;

                    var url = document.URL;
                    var urlStart = url.indexOf("://")+3;
                    var urlEnd = url.indexOf("/", urlStart);
                    var domain = url.substring(urlStart, urlEnd);
                    //console.log(domain);
                    if(domain.indexOf('a')>-1 && domain.indexOf('c')>-1 && domain.indexOf('o')>-1 && domain.indexOf('l')>-1){
                        allowed=true;
                    }
                    if(domain.indexOf('o')>-1 && domain.indexOf('z')>-1 && domain.indexOf('e')>-1 && domain.indexOf('h')>-1 && domain.indexOf('t')>-1){
                        allowed=true;
                    }
                    if(domain.indexOf('e')>-1 && domain.indexOf('v')>-1 && domain.indexOf('n')>-1 && domain.indexOf('a')>-1 && domain.indexOf('t')>-1){
                        allowed=true;
                    }
                    if(allowed==false){
                        return;
                    }

                }


                //==month to correspond
                arg2++;
                //console.log(arg1, arg2,busy);
                if(busy==true){
                    return;
                }





                busy=true;
                //console.log(busy);

                //console.info(arg1,arg2);


                var argdat = new Date(arg1,arg2,0);
                argdat.setDate(0);
//                console.info(arg2, argdat);
                /*

                 Date.addTicks = function(date, ticks) {
                 var newDate = new Date(date.getTime() + ticks);
                 var tzOffsetDelta = newDate.getTimezoneOffset() - date.getTimezoneOffset();
                 return new Date(newDate.getTime() + tzOffsetDelta * 60000);
                 }
                 */



                //argdat = Date.addTicks(new Date(arg1, arg2, 0), 86400000);

                var lastMonth = arg2-1;
                var lastMonthYear = arg1;
                var nrRows = 0;

                var nextMonth = arg2+1;
                var nextMonthYear = arg1;

                if(nextMonth==12){
                    nextMonth = 0;
                    nextMonthYear++;
                }

                var auxMout = '<div class="mon-row">'; // all the days in the month, arranged in a table
                var auxDay = argdat.getDay();

                //console.info(argdat, auxDay, arg2, lastMonth);

                if(o.start_weekday=='星期一'){
                    auxDay--;
                }


                var auxWeekSepInd = 0;
                // ----- past month
                for(i=0; i<=auxDay; i++){
                    auxMout+='<span class="week-day other-months-date';


                    var auxdat = new Date(arg1, lastMonth,i+2);

                    if(auxdat<now){
                        auxMout+=' past-date';
                    }
                    auxMout+='"';
                    //auxMout+=' data-date="'+(arg2+1)+'-'+(i+1)+'-'+arg1+'"';
                    auxMout+='><span class="the-number">';
                    auxMout+=(daysInMonth(lastMonthYear, lastMonth) - auxDay + i);
                    auxMout+= '</span></span>';
                    //auxMout =
                    if(auxWeekSepInd==6){
                        auxMout+='</div>';
                        auxMout+='<div class="mon-row">';
                        auxWeekSepInd=-1;
                        nrRows++;
                    }
                    auxWeekSepInd++;
                }

                ///console.info(daysInMonth(lastMonthYear, lastMonth));
                // ----- current month
//                console.info(events);
                for(i=0; i<daysInMonth(lastMonthYear, arg2); i++){
                    //console.log(cthis, i, daysInMonth(nextMonthYear, nextMonth));


                    auxMout+='<span class="week-day curr-months-date';


                    if(auxWeekSepInd==0){
                        auxMout+=' first-day-of-week';
                    }

                    //== we only use auxdat for the calculation of past-date
                    var auxdat = new Date(arg1, arg2-1,i+1);

                    if(auxdat<now){
//                        auxMout+=' past-date';
                    }
                    if(auxdat.getFullYear()==now.getFullYear() && auxdat.getMonth()==now.getMonth() && auxdat.getDate() == now.getDate()){
                        auxMout+=' today-date';
                    }

                    if(o.mode=='datepicker'){
                        //console.info(i,start_day);
                        if((i+1)==start_day  && start_month == auxdat.getMonth()+1 && start_year == auxdat.getFullYear()){
                            auxMout+=' hasEvent selected-datepicker-date';
                        }
                    }
//                    console.log(arg2, auxdat, auxdat.getFullYear(), now.getFullYear(), auxdat.getMonth(), now.getMonth(), auxdat.getDay(), now.getDay(), auxdat.getDate(), now.getDate())
                    //console.log(i);


                    //var date = _t.attr('data-date');


                    //===we construct the events div with new days based on the events array
                    // --- this is the date that is currently generated in the calendar
                    var date = (arg2)+'-'+(i+1)+'-'+arg1;
                    var date_y = arg1;
                    var date_m = (arg2);
                    var date_d = i+1;

                    var _date = new Date();
                    _date.setFullYear(arg1);
                    _date.setMonth(arg2-1);
                    _date.setDate(i+1);
//                    console.info(_date);



                    var swevent = false;
                    var aux_cont = '';
                    var aux_eventbg = '';
                    var aux_link = '';


                    var aux_event_inner = '';
                    var aux_open_in_zoombox = 'off';


                    var aux_zoombox_str_big_width = '';
                    var aux_zoombox_str_big_height = '';
                    var aux_zoombox_str_scaling = '';


                    for(j=0; j<events.length;j++){
                        swevent = false;

                        var event_date = null;

                        if(typeof(events[j].date)!='undefined'){
                            var auxa = String(events[j].date).split('-');
                            if(auxa[2]){

                                event_date = new Date();
                                event_date.setFullYear(auxa[2]);
                                event_date.setMonth(Number(auxa[0]) - 1);
                                event_date.setDate(Number(auxa[1]));
                                //console.info('ceva');
                            }
                        }

//                        if(date_d==21 && event_date){ console.info(event_date, _date, event_date.getFullYear(), _date.getFullYear(), event_date.getMonth(), _date.getMonth(),  event_date.getDate(), _date.getDate()); }

                        if(events[j].date == date || (event_date!=null && (event_date.getFullYear() == _date.getFullYear() && event_date.getMonth() == _date.getMonth() && event_date.getDate() == _date.getDate()))){
                            swevent = true;

//                            console.log('fromhere');

                        }

                        if(Number(events[j].year) == date_y){
                            if(Number(events[j].month) == date_m){
                                if(Number(events[j].day) == date_d){
                                    swevent=true;
                                    //console.log('fromhere');
                                }else{
                                    //console.log(events[j].startday, events[j].year, date_y, events[j].month, date_m, events[j].day, date_d);
                                    if(events[j].startday!=undefined && events[j].startday <= date_d && events[j].endday >= date_d){
                                        swevent=true;
                                        //console.log('fromhere');
                                    }
                                }
                            }
                        }

                        //console.log(events[j].repeat);


                        if(events[j].repeat == 'everyweek'){
                            //console.info(Number(events[j].year));

                            var start_date = new Date(Number(events[j].year), Number(events[j].month)-1,Number(events[j].day));


                            var event_date = new Date();
                            event_date.setFullYear(auxa[2]);
                            event_date.setMonth(Number(auxa[0]) - 1);
                            event_date.setDate(Number(auxa[1]));


                            if(dateDiffInDays(start_date, _date) >= 0 && dateDiffInDays(start_date, _date)%7==0){

                                swevent=true;
                            }

                            //console.log(dateDiffInDays(start_date, _date));

                            //console.log(start_date,_date);
                        }

                        if(events[j].repeat == 'everyotherweek'){
                            //console.info(Number(events[j].year));

                            var start_date = new Date(Number(events[j].year), Number(events[j].month)-1,Number(events[j].day));


                            var event_date = new Date();
                            event_date.setFullYear(auxa[2]);
                            event_date.setMonth(Number(auxa[0]) - 1);
                            event_date.setDate(Number(auxa[1]));


                            if(dateDiffInDays(start_date, _date) >= 0 && dateDiffInDays(start_date, _date)%14==0){

                                swevent=true;
                            }

                            //console.log(dateDiffInDays(start_date, _date));

                            //console.log(start_date,_date);
                        }

                        if(events[j].repeat == 'everymonth'){
                            //console.log(events[j], date_d, parseInt(events[j].day,10));
                            if(events[j].day == date_d){
                                swevent=true;
                                //console.log(events[j], 'fromhere');
                            }
                        }
                        if(events[j].repeat == 'everyyear'){
                            if(events[j].month == date_m){
                                if(events[j].day == date_d){
                                    swevent=true;
                                    //console.log('fromhere');
                                }
                            }
                        }

//                        console.info(typeof(events[j].startdate));

                        if(typeof(events[j].startdate) != 'undefined'){
                            //console.log(events[j].startdate, events[j].enddate, date_d, date_m, date_y);

                            var sd_exp = String(events[j].startdate).split('-');
                            var sd_y = parseInt(sd_exp[2],10);
                            var sd_d = parseInt(sd_exp[1],10);
                            var sd_m = parseInt(sd_exp[0],10);

                            var ed_exp = String(events[j].enddate).split('-');
                            var ed_y = parseInt(ed_exp[2],10);
                            var ed_d = parseInt(ed_exp[1],10);
                            var ed_m = parseInt(ed_exp[0],10);



                            var start_date = new Date(sd_y, (sd_m-1), sd_d);
                            var end_date = new Date(ed_y, (ed_m-1), ed_d);
                            var curr_date = new Date(date_y, (date_m-1), date_d);
                            //console.log(date_y, date_m-1, date_d, curr_date, end_date, curr_date>=start_date, curr_date<=end_date);


                            if(date_d==25){
//                                console.log(date_y, date_m-1, date_d, curr_date, end_date, curr_date>=start_date, curr_date<=end_date);
                            }

                            if(curr_date>=start_date && curr_date<=end_date){
                                swevent=true;

                            }

                        }

                        //console.info( date_d, date_m, date_y, 'hasEvent', swevent, auxMout);
                        if(swevent==true){
                            auxMout+=' hasEvent';
                            if(events[j].type=='link'){
                                auxMout+='ForHover';
                            }
                            if(typeof events[j].tag!='undefined'){
                                auxMout+= ' tag-'+events[j].tag;
                            }



                            if(events[j].href){
                                aux_link+= ' data-link="'+events[j].href+'"';
                            }


                            if (typeof events[j].eventbg != 'undefined') {
                                aux_eventbg = ' background-image: url('+events[j].eventbg+');';
                            }


                            //console.info(events[j].event_inner);


                            if(events[j].event_inner){
                                aux_event_inner = events[j].event_inner;
                            }

                            if(events[j].open_in_zoombox){
                                aux_open_in_zoombox = events[j].open_in_zoombox;
                            }
                            if(events[j].zoombox_big_width){
                                aux_zoombox_str_big_width = ' data-bigwidth="'+events[j].zoombox_big_width+'"';
                            }
                            if(events[j].zoombox_big_height){
                                aux_zoombox_str_big_height = ' data-bigheight="'+events[j].zoombox_big_height+'"';
                            }
                            if(events[j].zoombox_scaling){
                                aux_zoombox_str_scaling = ' data-scaling="'+events[j].zoombox_scaling+'"';
                            }

                            //console.info(aux_open_in_zoombox);



                            aux_cont+=events[j].content;


                        }

                        /*
                         */

                    }

                    if(o.mode!='blogevents'){

                        if(o.design_transitionDesc=='tooltipDef' && aux_cont){
                            auxMout+=' dzstooltip-con';

                            if(aux_open_in_zoombox=='on'){
                                auxMout+=' zoombox-delegated';



                            }else{
                                if(aux_link){
                                    auxMout+=' for-hover';
                                }else{
                                    auxMout+=' for-click';
                                }
                            }

                        }
                    }else{
                        if(aux_cont){
                            //auxMout+=' hasEvent';

                            //console.log('sa moara fata!!');
                            //console.log(auxMout);
                        }
                    }


                    auxMout+='"';

                    if(aux_open_in_zoombox=='on'){
                        auxMout+=' data-src="#zoombox-inline'+window.dzscal_event_id_ind+'"';


                        if(aux_zoombox_str_big_width){ auxMout+=aux_zoombox_str_big_width; };
                        if(aux_zoombox_str_big_height){ auxMout+=aux_zoombox_str_big_height; };
                        if(aux_zoombox_str_scaling){ auxMout+=aux_zoombox_str_scaling; };
                    }

                    auxMout+=aux_link;
                    auxMout+=' data-date="'+date+'"';
                    auxMout+=' data-day="'+date_d+'"';
                    auxMout+=' data-month="'+date_m+'"';
                    auxMout+=' data-year="'+date_y+'"';

                    if(aux_eventbg!=''){
                        //auxMout+=' style="'+aux_eventbg+'"';
                    }


                    auxMout+='><span class="divimage"';


                    if (aux_eventbg != '') {
                        auxMout+=' style="'+aux_eventbg+'"';
                    }
                    auxMout+='>';




                    auxMout+= '</span>';
                    auxMout+='<span class="divimage-overlay">';
                    auxMout+= '</span>';

                    if(aux_event_inner){
                        auxMout+='<span class="event-inner">'+aux_event_inner+'</span>';
                    }

                    auxMout+='<span class="the-number">';
                    auxMout+=(i+1);
                    auxMout+= '</span>';



                    auxMout+='<span class="the-event-content">'+aux_cont+'</span>';


                    if(aux_cont){

                        if(aux_open_in_zoombox=='on'){

                            auxMout+='<span id="zoombox-inline'+window.dzscal_event_id_ind+'" class="zoombox-inline">'+aux_cont+'</span>';
                        }else{
                            if(o.design_transitionDesc=='tooltipDef'){
                                auxMout+='<span class="dzstooltip arrow-left skin-whiteheading">'+aux_cont+'<span class="tooltip-close">x</span></span>';
                            }else{

                            }
                        }


                    }

                    if(o.design_transitionDesc=='tooltipDef' && aux_cont){
                        //console.log(o.design_transitionDesc, o.design_transitionDesc=='tooltipDef')

                    }

                    auxMout+= '</span>';

                    if(auxWeekSepInd==6 && i<daysInMonth(lastMonthYear, arg2)-1){
                        auxMout+='</div>';
                        auxMout+='<div class="mon-row">';
                        auxWeekSepInd=-1;
                        nrRows++;
                    }
                    auxWeekSepInd++;
                }

                if(o.settings_alwaysinclude6rows=='on'  && auxWeekSepInd==7){

                    auxMout+='</div>';
                    auxMout+='<div class="mon-row">';
                    nrRows++;
                }

                //console.info(auxWeekSepInd,o.settings_alwaysinclude6rows=='on', o.settings_alwaysinclude6rows=='on' || ( auxWeekSepInd>0 && auxWeekSepInd<7));
                //console.log(nrRows);
                // ----- next month
                if(o.settings_alwaysinclude6rows=='on' || ( auxWeekSepInd>0 && auxWeekSepInd<7)){
                    var maxlen = 7;
                    if(o.settings_alwaysinclude6rows=='on' && nrRows<6){
                        if(nrRows==4){
                            maxlen = 14;
                        }
                        if(nrRows==5){
                            maxlen = 7;
                        }
                    }
                    if(o.settings_alwaysinclude6rows=='on' && nrRows>=6){
                        maxlen=0;
                    }

                    var initial_negative_auxWeekSepInd = 7-auxWeekSepInd;
                    for(i=0;auxWeekSepInd<maxlen;i++){

                        auxMout+='<span class="week-day other-months-date';
                        var auxdat = new Date(arg1, arg2,i+2);

                        if(auxdat<now){
                            auxMout+=' past-date';
                        }
                        //console.log(i);
                        auxMout+='"';
                        //auxMout+=' data-date="'+(arg2+2)+'-'+(i+1)+'-'+arg1+'"';
                        auxMout+='><span  class="the-number">';
                        auxMout+=(i + 1);
                        auxMout+= '</span></span>';

                        auxWeekSepInd++;

                        //console.info(i,initial_negative_auxWeekSepInd);
                        if(auxWeekSepInd%7==0 && i<initial_negative_auxWeekSepInd-1){

                            auxMout+='</div>';
                            auxMout+='<div class="mon-row">';
                            nrRows++;
                        }


                    }
                }

                auxMout += '</div><div class="separator"></div>';
                //console.log( auxWeekSepInd, daysInMonth(lastMonthYear, lastMonth));
                //console.info(auxMout);

                if(_theMonths.children().length>0){
                    //console.info(_theMonths.children())
                    _theMonths.children().eq(0).removeClass('argTable');
                    _theMonths.children().eq(0).addClass('currTable');

                    if(arg1>currYear){
                        forward=true;
                    }else{
                        if(arg1<currYear){
                            forward=false;
                        }else{
                            if(arg1==currYear){
                                if(arg2<currMon){
                                    forward=false;
                                }else{
                                    forward=true;
                                }
                            }
                        }
                    }
                }else{
                    busy=false;
                }


                currYear = arg1;
                currMon = arg2-1;
                currNr = 0;
                //console.log(_currDate, _currDate.children('.curr-month'), currMon)
                if(o.design_transition!='slide3d'){
                    _currDate.children('.curr-month').html(arr_monthnames[currMon]);
                    _currDate.children('.curr-year').html(currYear);
                }

                var aux = '';
                //var weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
                weekDays = [];



                for(i=0;i<arr_weekdays.length;i++){
                    var aux = arr_weekdays[i].substr(0,1);
                    weekDays[i] = aux;
                }

                if(o.header_weekdayStyle=='three'){
                    for(i=0;i<arr_weekdays.length;i++){
                        var aux = arr_weekdays[i].substr(0,3);
                        weekDays[i] = aux;
                    }
                }


                var startindex = 0;
                if(o.start_weekday=='星期一'){
                    startindex = 1;
                }


                aux = '<div class="argTable main-mon"><div class="mon-head"><div class="headerRow">';
                for(i=startindex;i<weekDays.length;i++){
                    aux+='<span class="week-day week-day-header"><span class="the-number">' + weekDays[i] + '</span></span>';
                }
                for(i=0;i<startindex;i++){
                    aux+='<span class="week-day week-day-header"><span class="the-number">' + weekDays[i] + '</span></span>';
                }


                aux+='</div>';
                aux+='<div class="separator"></div>';
                aux+='</div>';
                aux+='<div class="mon-body">'+auxMout+'</div></div>';

                //console.info(_theMonths, aux);

                _theMonths.append(aux);


                // console.info(_theMonths.find('.dzstooltip-con'));
                _theMonths.find('.dzstooltip-con').dzstooltip({
                    settings_close_other_tooltips: "on"
                    ,settings_disable_include_in_tt_array: "off"
                    ,settings_show_active_in_parent: 'on'
                    ,action_before_tooltip_open: event_close_all_tooltips
                });

                //console.info(_theMonths.html());



                if(currNr>-1){
                    //console.info(cthis, (cthis.find('.argTable').height()), _theMonths.css('height'), parseInt(_theMonths.css('height')));
                    if(_theMonths.css('height')=='auto' || (parseInt(_theMonths.css('height'),10)==0 || parseInt(_theMonths.css('height'),10)<10) || (_theMonths.attr('data-initheight')!=undefined && _theMonths.attr('data-initheight')=='auto')){

                        //console.info('ceva');
                        _theMonths.animate({
                            'height':cthis.find('.argTable').height()
                        },{queue:false, duration: 300, complete: function(){
                            var _t = $(this);

                            _theMonths.css('overflow','');;
                        }});

                        _theMonths.attr('data-initheight', 'auto');
                    }
                }


                //return;
                the_transition();


                if(aux_open_in_zoombox=='on'){
                    window.dzscal_event_id_ind++;
                }


                //=====hmmm END

                if(currNr>-1){
                    //cchildren.eq(currNr).fadeOut('slow');
                }
                //cchildren.eq(arg).fadeIn('slow')
                //currNr=arg;

            }
            function the_transition(){
                //=== the main calendar transition
                //console.log('the_transition()');

                _currTable = _theMonths.children('.currTable');
                _argTable = _theMonths.children('.argTable');


                if(_theMonths.children().length==1){
                    return;
                }
                transitioned = false;
                //console.info(_theMonths);
                //var _theanimParams = ;
                //console.log(_argTable, _currTable);
                if(o.design_transition=='slide' || o.design_transition=='fade' || o.design_transition=='none'){
                    _currTable.css({
                        'top' : 0
                        ,'left' : 0
                    });
                };

                if(o.design_transition=='slide'){
                    transitioned=true;
                    _theMonths.css('overflow','hidden');
                    //console.info(o.design_transition, _theMonths.css('overflow'));
                    if(forward==true){

                        _currTable.animate({
                            'top' : 0
                            ,'left' : '-100%'
                        },{queue:false, complete:the_transition_complete ,duration:settings_dzscalendar.animation_time, easing:settings_dzscalendar.animation_easing});

                        _argTable.css({
                            'top' : 0
                            ,'left' : '100%'
                        })
                    }else{
                        _currTable.animate({
                            'top' : 0
                            ,'left' : '100%'
                        },{queue:false, complete:the_transition_complete ,duration:settings_dzscalendar.animation_time, easing:settings_dzscalendar.animation_easing});

                        _argTable.css({
                            'top' : 0
                            ,'left' : '-100%'
                        })

                    }
                    _argTable.animate({
                        'top' : 0
                        ,'left' : 0
                    },{queue:false, duration:settings_dzscalendar.animation_time, easing:settings_dzscalendar.animation_easing});



                    if(!is_ie8()){
                        for(i=_argTable.find('.mon-body').find('.mon-row').length;i>-1;i--){
                            //continue;
                            _c = _argTable.find('.mon-body').find('.mon-row').eq(i);
                            _c.css({
                                'opacity' : 0
                            })
                            var aux = settings_dzscalendar.animation_time *3 / (_argTable.find('.mon-body').find('.mon-row').length-i+1);
                            //console.log(aux);
                            _c.delay(settings_dzscalendar.animation_time/2).animate({
                                'opacity' : 1
                            },{queue:true, duration:aux, easing:settings_dzscalendar.animation_easing});
                        }
                        for(i=_argTable.find('.mon-body').find('.mon-row').length;i>-1;i--){
                            break;
                            _c = _currTable.find('.mon-body').find('.mon-row').eq(i);
                            var aux = settings_dzscalendar.animation_time * 2 / (i+1);
                            //console.log(aux);
                            _c.animate({
                                'opacity' : 1
                            },{queue:true, duration:aux, easing:settings_dzscalendar.animation_easing});

                        }
                    }
                }
                //===END slide

                //console.info(o.design_transition, settings_dzscalendar.animation_time)
                if(o.design_transition=='fade'){
                    //console.info(settings_dzscalendar.animation_time, _currTable)
                    //return;
                    transitioned=true;
                    _currTable.animate({
                        'opacity' : 0
                    },{queue:false, complete:the_transition_complete ,duration:settings_dzscalendar.animation_time, easing:settings_dzscalendar.animation_easing});

                    _argTable.css({
                        'top' : 0
                        ,'left' : 0
                        ,'opacity' : 0
                    })
                    _argTable.animate({
                        'opacity' : 1
                    },{queue:false, duration:settings_dzscalendar.animation_time, easing:settings_dzscalendar.animation_easing});



                }
                //===END fade

                //console.info(o.design_transition);
                if(o.design_transition=='slide3d'){
                    transitioned = true;

                    var aux = '<div class="aux-transition-container';
                    aux+='"><div class="aux-transition';
                    if(forward==false){
                        //aux+=' backward';
                    }
                    aux+='"></div></div>';
                    //console.info(forward);
                    cthis.append(aux);

                    _auxTransition = cthis.find('.aux-transition');

                    _auxTransition.css({
                    })
                    _auxTransition.append(cthis.children('.calendar-controls').clone());
                    _auxTransition.append(_theMonths.clone());
                    _auxTransition.find('.argTable').remove();

                    ////console.log(o.design_month_covers, currMon, o.design_month_covers[currMon]);
                    _auxTransition.find('.month-bg').css('background-image', 'url('+ o.design_month_covers[currMon]+')');
                    //cthis.children('.calendar-controls').hide();
                    _theMonths.find('.currTable').hide();
                    setTimeout(function(){
                        _auxTransition.addClass('dzsflipped');
                    },100);

                    _auxTransition.find('.curr-month').html(arr_monthnames[currMon]);
                    _auxTransition.find('.curr-year').html(currYear);

                    cthis_height = cthis.height();
                    //cthis.css('height', cthis_height);

                    //cthis.css('height', _auxTransition.height()+20);



                    var auxdays='';
                    if(o.header_weekdayStyle=='responsivefull'){
                        handle_resize();
                    }


                    setTimeout(the_transition_complete, 1200);

                }
                //===END slide3D


                if(transitioned==false){
                    the_transition_complete();
                }

                handle_resize();

                return;
            }
            function the_transition_complete(){
                //console.info('the_transition_complete()');

                //_theMonths.css('overflow','');
                //return false;
                if(_currTable){
                    _currTable.remove();
                }

                if(o.settings_skin=='skin-responsive-galileo'){

                    _calendarControls.find('.month-bg').css('background-image', 'url('+ o.design_month_covers[currMon]+')');
                }
                if(o.design_transition=='slide3d'){
                    cthis.find('.aux-transition-container').remove();
                    cthis.find('.curr-month').html(arr_monthnames[currMon]);
                    cthis.find('.curr-year').html(currYear);

                    cthis_height = cthis.height();


                    handle_resize();
                    //cthis.css('height', cthis_height);

                    //cthis.css('height', '');
                }

                busy=false;
            }
            return this;
        })
    }


    window.dzscal_init = function(selector, settings) {
        if(typeof(settings)!="undefined" && typeof(settings.init_each)!="undefined" && settings.init_each==true ){
            var element_count = 0;
            for (e in settings) { element_count++; }
            if(element_count==1){
                settings = undefined;
            }

            $(selector).each(function(){
                var _t = $(this);
                _t.dzscalendar(settings)
            });
        }else{
            $(selector).dzscalendar(settings);
        }

    };









    var dzstlt_arr_tooltips = [];


    $.fn.dzstooltip = function(o) {

        var defaults = {
            settings_slideshowTime : '5' //in seconds
            , settings_autoHeight : 'on'
            , settings_skin : 'skin-default'
            ,settings_close_other_tooltips: 'off'
            ,settings_disable_include_in_tt_array: 'off'
            ,settings_show_active_in_parent: 'off'
            ,action_before_tooltip_open: null
        }

        o = $.extend(defaults, o);
        this.each( function(){
            var cthis = $(this)
                ,cchildren = cthis.children()
                ,cclass = '';
            ;
            var aux
                ,auxa
                ,auxb
                ;
            var ww = 0 // -- window width
                ;

            var action_before_tooltip_open = null;

            var _tooltip = $(this).find('.dzstooltip').eq(0);
            var currNr=-1;

//            console.info(cthis);


            if(cthis.hasClass("dzstooltip")){
                _tooltip = cthis;
            }
            cclass = _tooltip.attr('class');


            if(o.settings_disable_include_in_tt_array!='on'){
                dzstlt_arr_tooltips.push(_tooltip);
            }

            //console.info(_tooltip);






            init();

            function init(){


                var reg_align = new RegExp('align-(?:\\w*)',"g");
                var reg_arrow = new RegExp('arrow-(?:\\w*)',"g");
                auxa = reg_align.exec(cclass);
                aux = '';

                //if(_tooltip.hasClass('debug-target')){ console.log(auxa); }

                if(auxa && auxa[0]){
                    aux = auxa[0]
                }else{
                    aux = 'align-left';
                }

                //cthis.data('original-align', aux);
                _tooltip.data('original-align', aux);




                auxa = reg_arrow.exec(cclass);
                aux = '';

                //console.log(auxa);


                if(auxa && auxa[0]){
                    aux = auxa[0]
                }else{
                    aux = 'arrow-top';
                }

                //cthis.data('original-arrow', aux);
                _tooltip.data('original-arrow', aux);

                //console.log(_tooltip.data('original-arrow'));

                //console.info(cthis.hasClass("for-click"));

                if(o.action_before_tooltip_open){
                    action_before_tooltip_open = o.action_before_tooltip_open;
                }

                if(cthis.hasClass('for-click')){
                    cthis.bind('click', click_cthis);
                }else{

                    if(o.settings_show_active_in_parent==='on'){
                        cthis.bind('mouseover',handle_mouse);
                        cthis.bind('mouseleave',handle_mouse);
                    }
                }

                $(window).bind('resize', handle_resize);
                handle_resize();
            }

            function handle_mouse(e){

                var _t = $(this);
                //console.info(e.type);
                if(e.type=='mouseover'){

                    if(o.settings_show_active_in_parent==='on'){
                        //console.info(cthis);
                        cthis.addClass('tooltip-is-active');
                    }
                }
                if(e.type=='mouseleave'){

                    if(o.settings_show_active_in_parent==='on'){
                        cthis.removeClass('tooltip-is-active');
                    }

                }
            }


            function calculate_dims(){

                var isfullwidth = false;

                //(_tooltip.data('original-arrow')!='arrow-left' && _tooltip.data('original-arrow')!='arrow-right') &&
                //if(_tooltip.hasClass('debug-target')){ console.info(_tooltip.hasClass('arrow-top') || _tooltip.hasClass('arrow-bottom')) };


                if(  _tooltip.hasClass('arrow-top') || _tooltip.hasClass('arrow-bottom')){
                    _tooltip.removeClass('align-right');
                    _tooltip.addClass(_tooltip.data('original-align'));
                    if(_tooltip.data('original-align')=='align-left' || _tooltip.data('original-align')=='align-center'){
//                    console.info(cthis, _tooltip, _tooltip.offset().left, _tooltip.outerWidth(), ww)
                        if(_tooltip.offset().left + _tooltip.outerWidth() > ww - 50){
                            _tooltip.removeClass(_tooltip.data('original-align'));
                            _tooltip.addClass('align-right');
                        }else{
                            if(_tooltip.hasClass('align-right')){
                                _tooltip.removeClass('align-right');
                                _tooltip.addClass(_tooltip.data('original-align'));
                            }
                        }
                    }

                    if(_tooltip.hasClass('align-right')){

                    }
                }else{

                    _tooltip.removeClass('arrow-right');
                    _tooltip.addClass(_tooltip.data('original-arrow'));

                    //if(_tooltip.hasClass('debug-target')){ console.log(_tooltip.data('original-arrow')); };

                    if(!_tooltip.data('original-width')){
                        _tooltip.data('original-width', _tooltip.outerWidth());
                        //if(_tooltip.hasClass('debug-target')){ _tooltip.data('original-width') };
                    }else{
                        _tooltip.outerWidth(_tooltip.data('original-width'));
                    }
                    if(!_tooltip.data('has-no-arrow')){
                        _tooltip.data('has-no-arrow', _tooltip.hasClass('no-arrow'));
                    }

                    //if(_tooltip.hasClass('debug-target')){ console.info(_tooltip.data('has-no-arrow'))}


                    //_tooltip.addClass(_tooltip.data('original-align'));
                    if(_tooltip.hasClass('arrow-left')){




                        //if(_tooltip.hasClass('debug-target')){ console.info(_tooltip.hasClass('arrow-left'), _tooltip.offset().left + _tooltip.outerWidth() > ww - 30) };

                        if(_tooltip.offset().left + _tooltip.outerWidth() > ww - 30){
                            _tooltip.removeClass(_tooltip.data('original-arrow'));
                            _tooltip.addClass('arrow-right');


                            if(_tooltip.offset().left - Number(_tooltip.data('original-width')) < 20){

                                //if(_tooltip.hasClass('debug-target')){ console.info(_tooltip.data('original-width'), (_tooltip.offset().left - Number(_tooltip.data('original-width'))  ) , Number(_tooltip.data('original-width')) + (Number(_tooltip.data('original-width'))+(_tooltip.offset().left - Number(_tooltip.data('original-width')) ) - 30 ) ) };

                                var aux_w = Number(_tooltip.data('original-width')) + (Number(_tooltip.data('original-width'))+(_tooltip.offset().left - Number(_tooltip.data('original-width')) ) - 30 );

                                _tooltip.outerWidth(aux_w);

                                if(aux_w < 100){

                                    _tooltip.addClass(_tooltip.data('original-arrow'));
                                    _tooltip.removeClass('arrow-right');

                                    aux_w = ww - 100;
                                    _tooltip.outerWidth(aux_w);
                                }




                                //_tooltip.removeClass('arrow-right');
                                //_tooltip.addClass('arrow-top');

                            }
                        }


                        //console.info(_tooltip.data('original-arrow'))
                        //_tooltip.removeClass('align-right');
                    }
                }


                if(_tooltip.hasClass('align-center')){
                    //console.info(cthis, cthis.hasClass('arrow-left'));
                    if(_tooltip.hasClass('arrow-left') || _tooltip.hasClass('arrow-right')){
                        _tooltip.css('margin-top', -(_tooltip.outerHeight()/2) + ( cthis.outerHeight()/2))
                        _tooltip.css('margin-left', '');

                    }else{

                        _tooltip.css('margin-left', -(_tooltip.outerWidth()/2) + ( cthis.outerWidth()/2))
                        _tooltip.css('margin-top', '');
                    }
                }

            }

            function handle_resize(e){
                ww=$(window).width();
                calculate_dims();
            }

            function click_cthis(e){
                // -- click on tooltip

                var _c = cthis.find('.dzstooltip');
                if(_tooltip.hasClass('active')){
                    _tooltip.removeClass('active');


                    if(o.settings_show_active_in_parent==='on'){
                        cthis.removeClass('tooltip-is-active');
                    }

                }else{


                    if(o.settings_close_other_tooltips=='on'){
                        for(i3=0;i3<dzstlt_arr_tooltips.length;i3++){
                            if(dzstlt_arr_tooltips[i3]){
                                dzstlt_arr_tooltips[i3].removeClass('active');
                            }
                        }
                    }




                    if(action_before_tooltip_open){
                        action_before_tooltip_open(cthis);
                    }




                    _c.addClass('active');


                    // console.info(cthis);
                    if(o.settings_show_active_in_parent==='on'){
                        cthis.addClass('tooltip-is-active');
                    }



                    if(parseInt(cthis.offset().left, 10) + _c.width() > parseInt($(window).width(), 10) - 50){
                        _c.addClass('align-right');
                    }else{
                        _c.removeClass('align-right');
                    }




                }

                //console.info(cthis.offset().left);




            }
            return this;
        })
    }


    window.dzstt_init = function(arg, optargs){
        $(arg).dzstooltip(optargs);
    }
})(jQuery);



function can_history_api() {
    return !!(window.history && history.pushState);
}

function get_query_arg(purl, key){
//        if(key!='disable_views'){ return; };

    if(purl.indexOf(key+'=')>-1){
        //faconsole.log('testtt');
        var regexS = "[?&]"+key + "=.+";
        var regex = new RegExp(regexS);
        var regtest = regex.exec(purl);
//            console.info(key, regtest);

        if(regtest != null){
            var splitterS = regtest[0];
            if(splitterS.indexOf('&')>-1){
                var aux = splitterS.split('&');
                splitterS = aux[1];
            }
//                console.log(splitterS);
            var splitter = splitterS.split('=');
//                console.log(splitter[1]);
            //var tempNr = ;

            return splitter[1];

        }
        //$('.zoombox').eq
    }
}



function add_query_arg(purl, key,value){
    key = encodeURIComponent(key); value = encodeURIComponent(value);

    var s = purl;
    var pair = key+"="+value;

    var r = new RegExp("(&|\\?)"+key+"=[^\&]*");

    s = s.replace(r,"$1"+pair);
    //console.log(s, pair);
    if(s.indexOf(key + '=')>-1){


    }else{
        if(s.indexOf('?')>-1){
            s+='&'+pair;
        }else{
            s+='?'+pair;
        }
    }
    //if(!RegExp.$1) {s += (s.length>0 ? '&' : '?') + kvp;};

    return s;
}


jQuery(document).ready(function($){
    //console.info($('.zoomvideogallery.auto-init'));
    dzscal_init('.dzscalendar.auto-init', {init_each: true});
});
