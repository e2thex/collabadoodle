Raphael.el.addPart = function (point) {
  var pathParts = this.attr('path') || [];
  pathParts.push(point);
  this.attr('path', pathParts);
}

function NULLAction(canvas) {
  action = {};
  action.canvas = canvas;
  action.start = function(e) { };
  action.continue = function(e) {};
  action.end = function(e) {};
  action.draw = function(attr) {};
  return action;
}

function PathAction(canvas) {
  action = {};
  action.longest_path = 10
  action.canvas = canvas;
  action.path;
  action.start = function(e) {
    e.preventDefault();
    var draw = action.canvas.paper.path();
    draw.attr(action.canvas.current_settings); 
    draw.addPart(['M', e.pageX , e.pageY]);
    action.path = draw;
  };
  action.continue = function(e) {
    e.preventDefault();
    draw = action.path;
    draw.addPart(['L', e.pageX , e.pageY]); 
    action.canvas.elements.push(draw);
    //lets start a new path so we do not get two long of a path
    if (draw.attr('path').length> action.longest_path) {
      this.start(e);
    }
  };
  action.end = function(e) {
    e.preventDefault();
    action.canvas.elements.push(action.path);
    action.canvas.call.comunicate();
  };
  action.draw = function(attr) {
    path_parts = attr.path;
    delete attr.path;
    path = action.canvas.paper.path();
    path.attr(attr);
    for (i in path_parts) {
      path.addPart(path_parts[i]);
    }
    return path;
  }
  return action;

}
function Canvas(id, div_id) {
  var canvas = {}
  canvas.paper = Raphael("canvas", 1000, 800);
  canvas.elements = [];
  canvas.calls = [];
  canvas.path_drawing = 0;
  canvas.actions = {
    'path' : PathAction,
  };
  canvas.defaultAction = 'path';
  canvas.currentAction = 'path';
  canvas.activeAction = NULLAction(canvas);
  canvas.current_settings = {
    'stroke': '#555555'
  
  }
  canvas.path = {};
  canvas.path.get = function(attr) {
    path = canvas.elements.filter(function(p) {
      return p.id.toString() == attr.id.toString();
    });
    return path.length>0 ? path[0] : false;
  };
  canvas.redraw = function(attr) {
    if (!canvas.path.get(attr)) {
      item = canvas.actions[attr.type](canvas).draw(attr);
      canvas.elements.push(item);
    }
  }
  canvas.elementsAttrs = function () {
    return canvas.elements.map(function (row) {
      row.attrs.id = row.id;
      row.attrs.type = row.type;
      return row.attrs;
    });
  };
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
    data.data = canvas.elementsAttrs();
    data.id = canvas.call.start();
    $.ajax({
      url: window.location, 
      dataType: 'json',
      data: data,
      type: 'POST',
      success:function(data, textStatus, jqXHR) {
        $.each(data.data, function () {
          canvas.redraw(this);
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
  $('#canvas').bind('vmousedown',function (e) { 
    canvas.activeAction = canvas.actions.path(canvas)
    canvas.activeAction.start(e);
  })
    .bind('vmousemove', function (e) {canvas.activeAction.continue(e)})
    .bind('vmouseup', function (e) {
      canvas.activeAction.end(e);
      canvas.activeAction = NULLAction(canvas);
  });
  $('#b').click(function (e) {canvas.call.comunicate(true)});
    canvas.call.comunicate(true);

});


