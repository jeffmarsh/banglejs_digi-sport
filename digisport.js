

// drawWidgets() is added by bootloader.js when loading a clock app, but when you upload via the IDE it just
// resets the watch and skips out running bootloader.js completely. So add the relevant code from the bootloader.
var WIDGETPOS={tl:32,tr:g.getWidth()-32,bl:32,br:g.getWidth()-32};
var WIDGETS={};
function drawWidgets() { for (var w of WIDGETS) w.draw(); }

require("FontCopasetic40x58Numeric").add(Graphics);
require("Storage").list().filter(a=>a[0]=='=').forEach(
  widget=>eval(require("Storage").read(widget)));
setTimeout(drawWidgets,100);

// Example application code
// Taken from https://github.com/espruino/BangleApps/blob/master/apps/sclock/clock-simple.js

/*
// I also took a giant exceprt from the amazing banglecharts which can be found at:
// https://github.com/jumjum123/Bangle/blob/master/modules/BangleChart.js
// Many thanks to the people the wrote it, you should really check it out.
*/
(function() {
    function bangleChart(){
      var radarIv;
      function init(){
        require("Font8x12").add(Graphics);
        g.setFont8x12();
      }
      function getArcXY(centerX,centerY,radius,angle){
        var s,r = [];
        s = 2 * Math.PI * angle / 360;
        r.push(centerX + Math.round(Math.cos(s) * radius));
        r.push(centerY + Math.round(Math.sin(s) * radius));
        return r;
      }
      function getArc(centerX,centerY,radius,startAngle,endAngle){
        var xy,r = [], actAngle = startAngle;
        var stepAngle = (radius + radius) * Math.PI / 60;
        stepAngle = 6;
        while(actAngle < endAngle){
          r = r.concat(getArcXY(centerX,centerY,radius,actAngle));
          actAngle += stepAngle;
          actAngle = Math.min(actAngle,endAngle);
        }
        return r.concat(getArcXY(centerX,centerY,radius,endAngle));
      }
      function drawPiece(centerX,centerY,radius,startAngle,endAngle){
        var polyData = [centerX,centerY];
        polyData = polyData.concat(getArc(centerX,centerY,radius,startAngle,endAngle));
        g.fillPoly(polyData,true);
      }
      function dataToRange(data,range){
        var sum = 0;
        data.map(function(num){return sum += num;});
        return data.map(function(num){return num * range / sum;});
      }
      this.cols = [2016,63489,65504,31];
      this.Slices = function(drawCircle, bgcolor, centerX,centerY,radius,data){
        var rad = radius;
        g.setColor(bgcolor);
        g.fillCircle(centerX,centerY,radius);
        var sliceSize = parseInt(radius / data.length) * 0.8;
        for(var i = 0; i < data.length;i++){
          g.setColor(this.cols[i]);
          drawPiece(centerX,centerY,rad,0,data[i] * 3.6);
          g.setColor(bgcolor);
          rad -= sliceSize;
          g.fillCircle(centerX,centerY,rad);
        }
        if (drawCircle){
          g.setColor(65535);
          g.drawCircle(centerX,centerY,radius);
        }
      };
      init();
    }
    var hh, mm,ss,ap,dd,dte;
    var batteryLevel = E.getBattery();
    var bc = new bangleChart();

    function formatTime(){
       var d = Date(); // get the current time from the watch
       var hour   = d.getHours();
       var minute = d.getMinutes();
       var second = d.getSeconds();
       var days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
       dd = days[d.getDay()];
       dte = d.getMonth() + "/" + d.getDay();
       ap = "AM";
       if (hour   > 11) { ap = "PM";             }
       if (hour   > 12) { hour = hour - 12;      }
       if (hour   == 0) { hour = 12;             }
       if (hour   < 10) { hour   = "0" + hour;   }
       if (minute < 10) { minute = "0" + minute; }
       if (second < 10) { second = "0" + second; }
       hh = hour;
       mm = minute;
       ss = second;
    }

    function checkTime(){
      formatTime();
      var timeStr = hh + ":" + mm + " " + ap;
      draw();
    }

    function draw(){
      var circleX = 50;
      var topCircleY = 50;
      var circleYOffset = 70;
      var circleRadius = 30;
      var bgcolor = "#3d3d3d";
      var fgcolor = "#ff9d00";
      batteryLevel=90; // temporary battery level until I start testing on the device
      g.clear();
      g.setFontAlign(0,0); // center font
      g.setFontVector(20);
      // circles
      g.setColor(bgcolor);
      g.fillCircle(circleX, topCircleY, circleRadius);
      g.fillCircle(circleX, topCircleY+circleYOffset, circleRadius);
      // day
      g.setColor(fgcolor);
      g.drawString(dd, circleX, topCircleY);
      // Date
      g.drawString(dte,circleX, topCircleY+circleYOffset);
      // Battery
      bc.cols = ["#114488"];
      bc.Slices(false, bgcolor, circleX,topCircleY+(circleYOffset*2),circleRadius,[batteryLevel,0,0,0]);
      g.setColor(fgcolor);
      g.setFontAlign(0,0); // center font
      g.setFontVector(20);
      g.drawString(batteryLevel+"%",circleX, topCircleY+(circleYOffset*2));
      // Time
      g.setFontCopasetic40x58Numeric();
      g.setColor(fgcolor);
      g.drawString(hh,150,90);
      g.drawString(mm,150,160);
    }

    // handle switch display on by pressing BTN1
    Bangle.on('lcdPower', function(on) {
        if (on) {
            drawWidgets();
            checkTime();
        }
    });

    // clean app screen
    g.clear();

    // refesh every 15 sec
    setInterval(checkTime, 15E3);

    // draw now
    checkTime();

})();
