window.onload = function() {
    new playAudio().init();
}
function playAudio() {
    this.playList = document.getElementById('playList');
    this.list = document.getElementsByTagName('li');
    this.audio = document.getElementsByTagName('audio')[0];
    this.lrc = document.getElementById('lrc');
    this.lyric = null;
    this.firstSong=null;
    this.firstIndex=null;
    this.currentIndex=0;
}
// 默认从第一首歌曲开始
playAudio.prototype = {
    constructor: playAudio,
    init: function() {
        var that=this;
        this.initPlayList(this);
        this.play(this.firstSong);
        // 播放完接着播放下一曲
        this.audio.onended=function(){
            // 这里this的值改变
            that.playNext(that,that.currentIndex);
        }
        // 点击歌单播放对应的歌曲
        var playList=this.playList.getElementsByTagName('li');
        for (var i = 0; i < playList.length; i++) {
            playList[i].onclick=(function(i){
                return function(){
                    that.currentIndex=i;
                    that.playNext(that,that.currentIndex-1)
                }
            }(i))
        };
    },
    // 初始化歌单
    initPlayList: function(cxt) {
        var xhttp = new XMLHttpRequest();
        xhttp.open('GET', 'src/content.json', false);
        // 这里this的值变化
        xhttp.onreadystatechange = function() {
            if (xhttp.status == 200 && xhttp.readyState == 4) {
                var fragment = document.createDocumentFragment();
                var data = JSON.parse(xhttp.responseText).data;
                // object类型
                var ol = cxt.playList.getElementsByTagName('ol')[0];
                data.forEach(function(v, i, a) {
                    var li = document.createElement('li'),
                        a = document.createElement('a');
                    a.href = "javascript:void(0)";
                    a.dataset.name = v.lrcName;
                    a.dataset.index=i;
                    a.innerHTML = v.songName + '-' + v.singer;
                    li.appendChild(a);
                    fragment.appendChild(li);
                });
                ol.appendChild(fragment);
            }
        }
        xhttp.send();
        a=document.getElementsByTagName('a'),
        this.firstSong=a[0].getAttribute('data-name');
        this.firstIndex=a[0].getAttribute('data-index');
        a[0].parentNode.className="currentSong";
    },
    play: function(songName) {
        var that = this;
        this.audio.src = "src/musicsrc/" + songName + ".mp3";
        this.getlrc(this.audio.src.replace('.mp3', '.lrc'));
        // sync the lyric
        this.audio.addEventListener("timeupdate", function(e) {
            if (!that.lyric) {
                return };
            for (var i = 0; i < that.lyric.length; i++) {
                var clearline=document.getElementById('line-'+ i);
                that.removeClass(clearline,'current-line');
            };
            for (var i = 0; i < that.lyric.length; i++) {
                if (this.currentTime > that.lyric[i][0] - 0.5) {
                    var line = document.getElementById('line-' + i);
                    preline = document.getElementById('line-' + (i > 0 ? i - 1 : i));
                }
                    that.removeClass(preline,'current-line');
                    that.addClass(line,'current-line');
                    that.lrc.style.top = 120 - that.getOffset(line) + 'px';
            };
        });
    },
    playNext:function(that,currentIndex){
        // 这里的关键点是要找到下一曲的src;
        var a=document.getElementsByTagName('a'),
            playInOrder=[],listNum=[];
        for (var i = 0; i < a.length; i++) {
            playInOrder.push(a[i].getAttribute('data-name'));
            listNum.push(a[i].getAttribute('data-index'));
            a[i].parentNode.className="";
        };
        console.log(listNum.length)
        if (currentIndex>listNum.length-1||this.currentIndex>listNum.length-1) {
            this.currentIndex=0;
            console.log("aaaaaaaaaa");
        }else{
            this.currentIndex=currentIndex+1;
        }
        console.log(this.currentIndex);
        this.play(playInOrder[this.currentIndex]);

        a[this.currentIndex].parentNode.className="currentSong";
    },
    getlrc: function(src) {
        var that = this,
            xhttp = new XMLHttpRequest();
        xhttp.open('GET', src, true);
        this.lrc.innerHTML="loading lyric..."
        xhttp.responseType = 'text';
        // 这里为什么用onload
        xhttp.onload = function() {
            //这里获得歌词文件
            var lyric = xhttp.response;
            // 这里解析歌词
            that.lyric = that.parselrc(lyric);
            // 0: 0 1: " 春风十里"
            that.addlrc(that.lyric);
        };
        xhttp.send();
    },
    parselrc: function(srcText) {
        // 将文本分隔成一行一行，存入数组
        var lines = srcText.split('\n');
        // console.log(lines);
        //用于匹配时间的正则表达式，匹配的结果类似[xx:xx.xx]
        var pattern = /\[\d{2}:\d{2}.\d{2}\]/g,
            result = [];
        // 去掉不包含事件的行
        while (!pattern.test(lines[0])) {
            lines = lines.slice(1);
        }
        lines.forEach(function(v, i, a) {
                //提取出时间[xx:xx.xx]
                var time = v.match(pattern),
                    // 提取歌词
                    value = v.replace(pattern, '');
                //因为一行里面可能有多个时间，所以time有可能是[xx:xx.xx][xx:xx.xx][xx:xx.xx]的形式，需要进一步分隔
                time.forEach(function(v1, i1, a1) {
                    // v1.slice(1, -1)这里是去掉[];
                    var t = v1.slice(1, -1).split(":");
                    result.push([parseInt(t[0], 10) * 60 + parseFloat(t[1]), value]);
                })
            })
            // 按时间大小排序
        result.sort(function(a, b) {
                return a[0] - b[0];
            })
        return result;
    },
    addlrc: function(srcText) {
        var fragment = document.createDocumentFragment();
        this.lrc.innerHTML = "";
        srcText.forEach(function(v, i, a) {
            var line = document.createElement('p');
            line.id = "line-" + i;
            line.className = 'line';
            line.index = i;
            line.innerHTML = v[1];
            fragment.appendChild(line);
        });
        this.lrc.appendChild(fragment);
    },
    getOffset: function(target) {
        var offset = 0,
            offset = target.index * 35;
        return offset;
    },
    hasClass: function(obj, cls) {
        // console.log(obj);
        return obj.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
    },
    removeClass: function(obj, cls) {
        if (this.hasClass(obj, cls)) {
            var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
            obj.className = obj.className.replace(reg, ' ');
        }
    },
    addClass:function(obj,cls){
           if (!this.hasClass(obj, cls)) obj.className += " " + cls;
    }
}
