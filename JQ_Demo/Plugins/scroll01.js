
   function listScroll(wrapper, prev, next, img, speed, autoplay) {
        var wraper = $(wraper);
        var prev = $(prev);
        var next = $(next);
        var img = $(img);
        var w = img.find('li').outerWidth(true);
        var s = speed;

        prev.click(function() {
            if(!img.is(':animated')) {
                img.find('li:last').prependTo(img);
                img.css({
                    'margin-left': -w
                });
                img.animate({
                    'margin-left': 0
                },500);
            }
        });

        next.click(function() {
            if(!img.is(':animated')) {
               img.animate({
                   'margin-left': -w
               },500,function() {
                   img.find('li').eq(0).appendTo(img);
                   img.css({
                       'margin-left': 0
                   });
               }); 
            }
        });

        if (autoplay) {
            timer = setInterval(function() {
                next.click();
            },s * 1000);
            wraper.hover(function() {
                clearInterval(timer);
            },
            function() {
                timer = setInterval(function() {
                    next.click();
                },s * 1000);
            });
        }
    }


        function list_scroll(wraper,img,direction,speed,autoplay) {
        var wraper = $(wraper);
        var img = $(img).find('ul');
        if(direction == 'X') {
            var w = img.find('li').outerWidth(true);
        }else{
            var w = img.find('li').outerHeight(true);
        }
        
        var s = speed;

        function scroll() {
            if(direction == 'X') {
                img.animate({
                    'margin-left': -w
                },500,function() {
                    img.find('li').eq(0).appendTo(img);
                    img.css({
                        'margin-left': 0
                    });
                });
            }else{
                img.animate({
                    'margin-top': -w
                },500,function() {
                    img.find('li').eq(0).appendTo(img);
                    img.css({
                        'margin-top': 0
                    });
                });
            }
            
        }

        if (autoplay) {
            ad = setInterval(function() {
                scroll();  
            },s * 1000);

            wraper.hover(function() {
                clearInterval(ad);
            },function() {
                ad = setInterval(function() {
                    scroll();
                },s * 1000);
            });
        }
    }
        