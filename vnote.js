
Raphael.el.addPart = function (point) {
  var pathParts = this.attr('path') || [];
  pathParts.push(point);
  this.attr('path', pathParts);
};

function Canvas(id, div_id) {
  var canvas = {}
  canvas.paper = Raphael("canvas", 1000, 800);
  canvas.paths = [];
  canvas.calls = [];
  canvas.path_drawing = 0;
  canvas.longest_path = 10;
  canvas.current_settings = {
    'stroke': '#555555'
  
  }
  canvas.path = {}
  canvas.path.start = function(e) {
    e.preventDefault();
    canvas.path_drawing = 1;
    var draw = canvas.paper.path();
    draw.attr(canvas.current_settings); 
    draw.addPart(['M', e.pageX , e.pageY]);
    canvas.paths.push(draw);
  };
  canvas.path.drawPart = function(e) {
    e.preventDefault();
    if(canvas.path_drawing == 1) {
      var draw = canvas.paths.pop()
      draw.addPart(['L', e.pageX , e.pageY]); 
      canvas.paths.push(draw);
      //lets start a new path so we do not get two long of a path
      if (draw.attr('path').length> canvas.longest_path) {
        this.start(e);
      }
    }
  };
  canvas.path.end = function(e) {
    e.preventDefault();
    canvas.path_drawing = 0;
    canvas.call.comunicate();
  };
  canvas.path.get = function(attr) {
    path = canvas.paths.filter(function(p) {
      return p.id.toString() == attr.id.toString();
    });
  /*
    path = canvas.paths.filter(function(p) {
      n2s = function(key,value) {
        if(typeof(value) == 'number') {
          return value.toString();
        }
        return value;
      }
      return JSON.stringify(p.attrs,n2s) == JSON.stringify(attr,n2s);
    });
    */
    return path.length>0 ? path[0] : false;
  };
  canvas.pathsAttrs = function () {
    return canvas.paths.map(function (row) {
      row.attrs.id = row.id;
      return row.attrs;
    });
  };
  canvas.path.draw = function(attr) {
    if (!canvas.path.get(attr)) {
      path_parts = attr.path;
      delete attr.path;
      path = canvas.paper.path();
      path.attr(attr);
      for (i in path_parts) {
        path.addPart(path_parts[i]);
      }
      canvas.paths.push(path);
    }
  }
  canvas.call = {}
  canvas.call.end = function(id) {
    index = canvas.calls.indexOf(id);
    if(index > -1) {
      canvas.calls.splice(index, 1);
    }
  };
  canvas.call.start = function() {
    id ='a' + (new Date()).getTime()
    canvas.calls.push(id);
    return id;
  };
  canvas.call.comunicate = function(is_new) {
    data = {
      'data_call': true
    };
    if(is_new) {
      data.new = true;
    }
    data.data = canvas.pathsAttrs();
    data.id = canvas.call.start();
    
    $.ajax({
      url: window.location, 
      dataType: 'json',
      data: data,
      type: 'POST',
      success:function(data, textStatus, jqXHR) {
        $.each(data.data, function () {
          canvas.path.draw(this);
        });
        canvas.call.end(data.id);
        if(canvas.calls.length <1) {
          canvas.call.comunicate();
        }
      }
    });
  };
  return canvas;

}

function getRandomInt(min, max) {  
  return Math.floor(Math.random() * (max - min + 1)) + min;  
}  
$(document).bind('pageinit', function() {
  var canvas = Canvas();
  $('#canvas').bind('vmousedown',function (e) {canvas.path.start(e);})
    .bind('vmousemove', function (e) {canvas.path.drawPart(e)})
    .bind('vmouseup', function (e) {canvas.path.end(e)});
  $('#b').click(function (e) {canvas.call.comunicate(true)});
    canvas.call.comunicate(true);

});


