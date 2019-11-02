
function addTouchListWrapper( option ) {
        //事件注册给哪个对象？默认document
        var d = option.target == undefined ? document : option.target;
        //指示线与ul滑动距离比
        var scale = option.scale ? option.scale : 1;
        //是单点还是多点触控，支持single、more，默认more
        var isMorePointTouch = option.isMorePointTouch == undefined ? true : option.isMorePointTouch;
        //滑动类型，取值：垂直tab、水平tab、垂直轮播、水平轮播
        var slideType = option.slideType;
        //导航小圆点的父元素
        var circle = option.circle == undefined ? undefined : option.circle;
        //是否自动轮播
        var autoPlay = option.autoPlay == undefined ? false : option.autoPlay;
        //tab指示线
        var tabLine = option.tabLine;
        //滑动前tab指示线上面的a元素
        var slideNowElm = null;
        //内容
        var ul = option.ul;
        //滑动前显示在屏幕以内的li
        var slideNowElmLi = null;
        //滑动定时器
        var ms = 0;
        //轮播图定时器
        var timmer = null;
        //手指触碰屏幕的X的起始位置
        var startX = 0;
        //tab指示线上一次滑动的translateX
        var lastTransLateX_hr = null;
        //内容上一次滑动的translateX
        var lastTransLateX_ul = null;
        //记录屏幕上所有滑动信息的数组
        var touchInformation = [];
        //自定义索引
        var index = -1;
        //上一个滑动的touc对象
        var movingTouch = null;
        //上一次滑动后的坐标
        var beforeDistansX = null;
        //touch对象唯一标识
        var touch_identity = null;
        //屏幕上的最新触摸点
        var lastTouch = null;
        //chrome passive
        var passive = { passive: true };

        function play() {
            //定时滑动
            timmer = setInterval( function () {
                shuffling();
            }, 1000 );
        }

        //轮播图无缝结合
        function set_shuffling() {
            var bool = slideType.includes( "水平" );
            var t;
            //第一个元素前面的最后一个元素
            if ( slideNowElmLi.getAttribute( "index" ) == "last" ) {
                t = bool ? ul.querySelector( "li:last-child" ).previousElementSibling.offsetLeft
                    : ul.querySelector( "li:last-child" ).previousElementSibling.offsetTop;
                //替换为最后一个元素
                ul.style.transitionDuration = "0ms";
                ul.style.transform = ( bool ? "translateX" : "translateY" ) + "(-" + t + "px)";
                slidebeforeTranslate_ul = t;
                //更改slideNowElmLi为替换后的当前元素
                slideNowElmLi = getNowElement( ul, ul.querySelectorAll( "li" ), bool ? 0 : 1 );
            }
            //最后一个元素后面的第一个元素
            else if ( slideNowElmLi.getAttribute( "index" ) == "first" ) {
                t = bool ? ul.querySelector( "li:first-child" ).nextElementSibling.offsetLeft
                    : ul.querySelector( "li:first-child" ).nextElementSibling.offsetTop;
                //替换为第一个元素
                ul.style.transitionDuration = "0ms";
                ul.style.transform = bool ? "translateX(-" + t + "px)" : "translateY(-" + t + "px)";
                slidebeforeTranslate_ul = t;
                //更改slideNowElmLi为替换后的当前元素
                slideNowElmLi = getNowElement( ul, ul.querySelectorAll( "li" ), bool ? 0 : 1 );
            }
        }

        //自动轮播
        function shuffling() {
            var bool = slideType.includes( "水平" );
            var distans_circle;
            //当前屏幕上的li元素
            slideNowElmLi = getNowElement( ul, ul.querySelectorAll( "li" ), bool ? 0 : 1 );
            set_shuffling();
            ul.style.transitionDuration = "300ms";
            ul.style.transform = bool ? "translateX(-" + slideNowElmLi.nextElementSibling.offsetLeft + "px)" : "translateY(-" + slideNowElmLi.nextElementSibling.offsetTop + "px)";
            if ( !circle ) return;
            var circleIndex = slideNowElmLi.nextElementSibling.getAttribute( "circleIndex" );
            bool ? distans_circle = circle.parentNode.querySelectorAll( "li" )[circleIndex].offsetLeft - parseFloat( getComputedStyle( circle ).marginLeft )
                : distans_circle = circle.parentNode.querySelectorAll( "li" )[circleIndex].offsetTop - parseFloat( getComputedStyle( circle ).marginTop );
            circle.style.transform = ( bool ? "translateX" : "translateY" ) + "(" + distans_circle + "px)";
        }

        //为第一张图和最后一张图的无缝结合动态添加节点
        function addChild() {
            var bool = slideType.includes( "水平" );
            var first = ul.querySelector( "li:first-child" );
            var last = ul.querySelector( "li:last-child" );
            var newfirst = first.cloneNode( true );
            newfirst.setAttribute( "index", "first" );
            ul.appendChild( newfirst );
            var newlast = last.cloneNode( true );
            newlast.setAttribute( "index", "last" );
            ul.prepend( newlast );
            //将ul定位到第一张图片
            ul.style.transitionDuration = "0s";
            ul.style.transform = bool ? "translateX( -" + ul.parentNode.offsetWidth + "px)" : "translateY( -" + ul.parentNode.offsetHeight + "px)";
        }

        if ( slideType.includes( "轮播" ) ) {
            addChild();
        }

        //启用自动轮播
        if ( autoPlay ) play();

        //如果当前滑动元素的translateX绝对等于参数2指定的元素与父元素的左边距，则返回真
        function testRange( moving, elm, transType ) {
            var movingTranslate;
            if ( transType == 1 ) {
                movingTranslate = moving.style.transform.replace( "translateY(", '' ).replace( "px)", '' ) == false ? 0 : parseFloat( moving.style.transform.replace( "translateY(", '' ).replace( "px)", '' ) );
                if ( Math.abs( movingTranslate ) == elm.offsetTop ) return true;
            }
            else {
                movingTranslate = moving.style.transform.replace( "translateX(", '' ).replace( "px)", '' ) == false ? 0 : parseFloat( moving.style.transform.replace( "translateX(", '' ).replace( "px)", '' ) );
                if ( Math.abs( movingTranslate ) == elm.offsetLeft ) return true;
            }
        }

        //获取当前指示线上面的a元素或屏幕以内的li元素
        function getNowElement( moving, chiList, transType ) {
            return Array.from( chiList ).filter( elm => {
                if ( testRange( moving, elm, transType ) ) return elm;
            } )[0];
        }

        //根据方向获取元素的translate
        function getTranslaste( el, direction ) {
            if ( direction == 1 ) {
                return el.style.transform.replace( "translateY(", '' ).replace( "px)", '' ) == false ? 0 : parseFloat( el.style.transform.replace( "translateY(", '' ).replace( "px)", '' ) );
            }
            return el.style.transform.replace( "translateX(", '' ).replace( "px)", '' ) == false ? 0 : parseFloat( el.style.transform.replace( "translateX(", '' ).replace( "px)", '' ) );
        }

        //滑动中
        function slideX( touch ) {
            if ( touch.moveX - beforeDistansX == 0 ) { return; }
            var ulDistans = 0;
            var distans = 0;
            var ulTranslate;
            var bool = slideType.includes( "水平" );
            if ( slideType.includes( "tab" ) ) {
                var hrTranslate;
                if ( slideType.includes( "水平" ) ) hrTranslate = getTranslaste( tabLine, 0 );
                else hrTranslate = getTranslaste( tabLine, 1 );
            }
            if ( slideType.includes( "水平" ) ) ulTranslate = getTranslaste( ul, 0 );
            else ulTranslate = getTranslaste( ul, 1 );
            movingTouch = touch.touch_identity;
            //手指左滑
            if ( touch.moveX - beforeDistansX < 0 ) {
                console.log( "手指左滑或上滑" );
                //即时记录手指左滑的坐标，右滑（上滑）时用最后一个左滑坐标作为起始坐标计算左滑距离
                touch.slideLeftEndPoint = touch.moveX;
                touch.leftSlideTranslateX = hrTranslate == undefined ? null : hrTranslate;
                touch.leftSlideTranslateX_ul = ulTranslate;
                //最后一个元素不能左滑（上滑）
                var translate = hrTranslate != undefined ? hrTranslate : ulTranslate;
                var nowElm = hrTranslate != undefined ? slideNowElm : slideNowElmLi;
                if ( translate != parseFloat( slideType.includes( "水平" ) ? nowElm.parentNode.offsetWidth : nowElm.parentNode.offsetHeight ) - parseFloat( slideType.includes( "水平" ) ? nowElm.offsetWidth : nowElm.offsetHeight ) ) {
                    var startPoint = touch.slideRightEndPoint == null ? touch.startX : touch.slideRightEndPoint;
                    if ( slideType.includes( "tab" ) ) {
                        distans = ( touch.rightSlideTranslateX == null ? touch.translateX_tabline : touch.rightSlideTranslateX ) + Math.abs( touch.moveX - startPoint ) * scale;
                        var slideAfterSibling = slideNowElm.nextElementSibling.nodeName.toLowerCase() == "a" ? slideNowElm.nextElementSibling : slideNowElm;
                        var leftOrTop = slideType.includes( "水平" ) ? slideAfterSibling.offsetLeft : slideAfterSibling.offsetTop;
                        if ( distans >= leftOrTop ) distans = leftOrTop;
                        console.log( distans );
                        slideType.includes( "水平" ) ? tabLine.style.transform = "translateX(" + distans + "px)" : tabLine.style.transform = "translateY(" + distans + "px)";
                    }
                    ulDistans = -( touch.rightSlideTranslateX_ul == null ? Math.abs( touch.translateX_ul ) : Math.abs( touch.rightSlideTranslateX_ul ) ) + ( touch.moveX - startPoint );
                    console.log( touch.translateX_ul );
                    var slideAfterSiblingLi = slideNowElmLi.nextElementSibling == null ? slideNowElmLi : slideNowElmLi.nextElementSibling;
                    var leftOrTop = slideType.includes( "水平" ) ? slideAfterSiblingLi.offsetLeft : slideAfterSiblingLi.offsetTop;
                    if ( Math.abs( ulDistans ) >= leftOrTop ) ulDistans = -leftOrTop;
                    ul.style.transform = ( bool ? "translateX" : "translateY" ) + "(" + ulDistans + "px)";
                }
            }
            //手指右滑
            else if ( touch.moveX - beforeDistansX > 0 ) {
                console.log( "手指右滑或下滑" );
                //即时记录手指右滑的坐标，左滑时用最后一个右滑坐标作为起始坐标计算右滑距离
                touch.slideRightEndPoint = touch.moveX;
                touch.rightSlideTranslateX = hrTranslate == undefined ? null : hrTranslate;
                touch.rightSlideTranslateX_ul = ulTranslate;
                //第一个元素不能右滑
                var translate = hrTranslate != undefined ? hrTranslate : ulTranslate;
                if ( translate != 0 ) {
                    var startPoint = touch.slideLeftEndPoint == null ? touch.startX : touch.slideLeftEndPoint;
                    if ( slideType.includes( "tab" ) ) {
                        distans = ( touch.leftSlideTranslateX == null ? touch.translateX_tabline : touch.leftSlideTranslateX ) - ( touch.moveX - startPoint ) * scale;
                        var slideBeforeSibling = slideNowElm.previousElementSibling == null ? slideNowElm : slideNowElm.previousElementSibling;
                        var leftOrTop = slideType.includes( "水平" ) ? slideBeforeSibling.offsetLeft : slideBeforeSibling.offsetTop;
                        if ( distans <= leftOrTop ) distans = leftOrTop;
                        slideType.includes( "水平" ) ? tabLine.style.transform = "translateX(" + distans + "px)" : tabLine.style.transform = "translateY(" + distans + "px)";
                    }
                    ulDistans = ( touch.leftSlideTranslateX_ul == null ? Math.abs( touch.translateX_ul ) : Math.abs( touch.leftSlideTranslateX_ul ) ) - ( touch.moveX - startPoint );
                    ulDistans = -ulDistans;
                    var slideBeforeSiblingLi = slideNowElmLi.previousElementSibling == null ? slideNowElmLi : slideNowElmLi.previousElementSibling;
                    var leftOrTop = slideType.includes( "水平" ) ? slideBeforeSiblingLi.offsetLeft : slideBeforeSiblingLi.offsetTop;
                    if ( ulDistans >= -( leftOrTop ) ) ulDistans = -( leftOrTop );
                    ul.style.transform = ( bool ? "translateX" : "translateY" ) + "(" + ulDistans + "px)";
                }
            }
            beforeDistansX = touch.moveX;
            lastTransLateX_hr = hrTranslate == undefined ? null : hrTranslate;
            lastTransLateX_ul = ulTranslate;
        }

        //滑动未至，则原路退回，滑动过半，则自动吸附
        function setRange( msflag ) {
            var distans = 0;
            var ulDistans = 0;
            var circleIndex = null;
            var bool = slideType.includes( "水平" );
            if ( slideType.includes( "tab" ) ) {
                var hrTranslate = bool ? getTranslaste( tabLine, 0 ) : getTranslaste( tabLine, 1 );
                var slideBeforeSibling = slideNowElm.previousElementSibling;
                var slideAfterSibling = slideNowElm.nextElementSibling;
                var afterLeft = slideAfterSibling.nodeName.toLowerCase() != "a" ? null : bool ? parseFloat( slideAfterSibling.offsetLeft ) : parseFloat( slideAfterSibling.offsetTop );
                var nowLeft = bool ? parseFloat( slideNowElm.offsetLeft ) : parseFloat( slideNowElm.offsetTop );
                var beforeLeft = slideBeforeSibling == null ? null : bool ? parseFloat( slideBeforeSibling.offsetLeft ) : parseFloat( slideBeforeSibling.offsetTop );
            }
            var ulTranslate = bool ? Math.abs( getTranslaste( ul, 0 ) ) : Math.abs( getTranslaste( ul, 1 ) );
            var slideBeforeSiblingLi = slideNowElmLi.previousElementSibling == null ? slideNowElmLi : slideNowElmLi.previousElementSibling;
            var slideAfterSiblingLi = slideNowElmLi.nextElementSibling == null ? slideNowElmLi : slideNowElmLi.nextElementSibling;
            var fatherWidth = bool ? parseFloat( ul.parentNode.offsetWidth ) : parseFloat( ul.parentNode.offsetHeight );
            var nowLeft_ul;
            var afterLeft_ul;
            var beforeLeft_ul;
            if ( bool ) {
                nowLeft_ul = slideNowElmLi.offsetLeft;
                afterLeft_ul = slideAfterSiblingLi.offsetLeft;
                beforeLeft_ul = slideBeforeSiblingLi.offsetLeft;
            }
            else {
                nowLeft_ul = slideNowElmLi.offsetTop;
                afterLeft_ul = slideAfterSiblingLi.offsetTop;
                beforeLeft_ul = slideBeforeSiblingLi.offsetTop;
            }
            if ( msflag && ulTranslate > nowLeft_ul ) { distans = afterLeft; ulDistans = afterLeft_ul; circleIndex = slideAfterSiblingLi.getAttribute( "circleIndex" ); }
            else if ( msflag && ulTranslate < nowLeft_ul ) { distans = beforeLeft; ulDistans = beforeLeft_ul; circleIndex = slideBeforeSiblingLi.getAttribute( "circleIndex" ); }
            else if ( ulTranslate - nowLeft_ul > fatherWidth / 2 ) { hrTranslate != undefined ? distans = afterLeft : ""; ulDistans = afterLeft_ul; circleIndex = slideAfterSiblingLi.getAttribute( "circleIndex" ); }
            else if ( ulTranslate - nowLeft_ul < -fatherWidth / 2 ) { distans = beforeLeft; ulDistans = beforeLeft_ul; circleIndex = slideBeforeSiblingLi.getAttribute( "circleIndex" ); }
            else { distans = nowLeft; ulDistans = nowLeft_ul; circleIndex = slideNowElmLi.getAttribute( "circleIndex" ); }
            ul.style.transitionDuration = "300ms";
            if ( bool ) {
                if ( slideType.includes( "tab" ) ) {
                    tabLine.style.transitionDuration = "300ms";
                    tabLine.style.transform = "translateX(" + distans + "px)";
                }
                ul.style.transform = "translateX(" + -ulDistans + "px)";
            }
            else {
                if ( slideType.includes( "tab" ) ) {
                    tabLine.style.transitionDuration = "300ms";
                    tabLine.style.transform = "translateY(" + distans + "px)";
                }
                ul.style.transform = "translateY(" + -ulDistans + "px)";
            }
            if ( circle ) {
                var distans_circle;
                distans_circle = bool ? circle.parentNode.querySelectorAll( "li" )[circleIndex].offsetLeft - parseFloat( getComputedStyle( circle ).marginLeft )
                    : circle.parentNode.querySelectorAll( "li" )[circleIndex].offsetTop - parseFloat( getComputedStyle( circle ).marginTop );
                circle.style.transform = ( bool ? "translateX" : "translateY" ) + "(" + distans_circle + "px)";
            }
            //清空屏幕触控点信息
            touchInformation = [];
            index = -1;
            beforeDistansX = null;
            lastTransLateX_hr = null;
            lastTransLateX_ul = null;
        }

        d.addEventListener( "touchstart", function ( e ) {
            var slidebeforeTranslate_ul = 0;
            var bool = slideType.includes( "水平" );
            if ( getNowElement( ul, ul.querySelectorAll( "li" ), bool ? 0 : 1 ) != null ) {
                //当前屏幕上的li元素
                slideNowElmLi = getNowElement( ul, ul.querySelectorAll( "li" ), bool ? 0 : 1 );
            }
            if ( bool ) {
                beforeDistansX = startX = e.touches[e.touches.length - 1].clientX;
                if ( slideType.includes( "tab" ) ) {
                    if ( getNowElement( tabLine, tabLine.parentNode.querySelectorAll( "a" ), 0 ) != null ) {
                        //当前tab指示线上面的a元素
                        slideNowElm = getNowElement( tabLine, tabLine.parentNode.querySelectorAll( "a" ), 0 );
                    }
                    var slidebeforeTranslate_hr = Math.abs( getTranslaste( tabLine, 0 ) );
                }
                if ( slideType.includes( "轮播" ) ) {
                    if ( autoPlay ) clearInterval( timmer );//触摸时关掉定时滑动
                    set_shuffling();
                }
            }
            else {
                beforeDistansX = startX = e.touches[e.touches.length - 1].clientY;
                if ( slideType.includes( "tab" ) ) {
                    if ( getNowElement( tabLine, tabLine.parentNode.querySelectorAll( "a" ), 1 ) != null ) {
                        //当前tab指示线上面的a元素
                        slideNowElm = getNowElement( tabLine, tabLine.parentNode.querySelectorAll( "a" ), 1 );
                    }
                    var slidebeforeTranslate_hr = Math.abs( getTranslaste( tabLine, 1 ) );
                }
                if ( slideType.includes( "轮播" ) ) {
                    if ( autoPlay ) clearInterval( timmer );//触摸时关掉定时滑动
                    set_shuffling();
                }
            }
            slidebeforeTranslate_ul = Math.abs( getTranslaste( ul, bool ? 0 : 1 ) );
            touch_identity = e.touches[e.touches.length - 1].identifier;
            touchInformation.push( {
                //触摸唯一标识
                touch_identity: touch_identity,
                //自定义索引
                index: ++index,
                //起始坐标
                startX: startX,
                //移动坐标
                moveX: startX,
                //tab指示线的偏移距离
                translateX_tabline: slidebeforeTranslate_hr,
                //ul的偏移距离
                translateX_ul: slidebeforeTranslate_ul,
                //tab指示线左滑实时translateX
                leftSlideTranslateX: null,
                //tab指示线右滑实时translateX
                rightSlideTranslateX: null,
                //ul左滑实时translateX
                leftSlideTranslateX_ul: null,
                //ul右滑时实时偏移距离
                rightSlideTranslateX_ul: null,
                //右滑实时移动点
                slideRightEndPoint: null,
                //左滑实时移动点
                slideLeftEndPoint: null,
                //上一个移动点
                beforeDistansX: startX
            } );
            if ( slideType.includes( "tab" ) ) tabLine.style.transitionDuration = "0ms";
            ul.style.transitionDuration = "0ms";
            ms = new Date().getTime();
        }, passive );

        d.addEventListener( "touchmove", function ( e ) {
            if ( touchInformation == null ) return;
            lastTouch = e.touches[e.touches.length - 1];
            length = touchInformation.length;
            var touch;
            for ( var i = length - 1; i >= 0; i-- ) {
                //只有接触屏幕的最后一根手指才可以滑动
                if ( touchInformation[i].touch_identity == lastTouch.identifier ) {
                    touch = touchInformation[i];
                    break;
                }
            }
            //多点触控
            if ( isMorePointTouch ) {
                if ( lastTouch.identifier != movingTouch ) {
                    if ( slideType.includes( "tab" ) ) touch.translateX_tabline = lastTransLateX_hr == null ? touch.translateX_tabline : lastTransLateX_hr;
                    touch.translateX_ul = lastTransLateX_ul == null ? touch.translateX_ul : lastTransLateX_ul;
                    touch.rightSlideTranslateX = touch.rightSlideTranslateX_ul = touch.leftSlideTranslateX = touch.leftSlideTranslateX_ul = touch.slideLeftEndPoint = touch.slideRightEndPoint = null;
                    if ( slideType.includes( "水平" ) ) touch.startX = lastTouch.clientX;
                    else touch.startX = lastTouch.clientY;
                }
            }
            //单点触控
            else {
                if ( lastTouch.identifier != movingTouch && movingTouch != null ) {
                    setRange();
                    return;
                }
            }
            if ( slideType.includes( "水平" ) ) touch.moveX = lastTouch.clientX;
            else touch.moveX = lastTouch.clientY;
            lastTouch = touch;
            slideX( lastTouch );
        }, passive );

        d.addEventListener( "touchend", function ( e ) {
            //删除touchInformation中抬起的touch对象
            index -= 1;
            //不设置吸附
            if ( slideType.includes( "tab" ) ) {
                if ( getNowElement( tabLine, tabLine.parentNode.querySelectorAll( "a" ), slideType.includes( "水平" ), slideType.includes( "水平" ) ? 0 : 1 ) != null ) {
                    return;
                }
            }
            if ( e.touches.length == 0 ) {
                var flag = new Date().getTime() - ms <= 200;
                setRange( flag );
                if ( slideType.includes( "tab" ) ) tabLine.style.transition = "none 0 ease";
                ul.style.transition = "none 0 ease";
                if ( autoPlay ) {
                    play();
                }
            }
        }, passive );

        d.addEventListener( "touchcancel", function ( e ) {
            setRange();
            if ( slideType.includes( "tab" ) ) tabLine.style.transition = "none 0 ease";
            ul.style.transition = "none 0 ease";
            if ( autoPlay ) {
                play();
            }
        }, passive );
    }
