//"use strict";
(function() {
    // configuration
    var pointRadius = 5;
    var clickBox = 60;
    
    var canvases = [document.getElementById('c1')];

    var contexts = [];
    canvases.forEach(function(canvas) {
        contexts.push(canvas.getContext('2d'));
    });

    var add = null;
    function getRadioValue() {
        add = document.querySelector('input[name="add_group"]:checked').value;
        console.log('Radio value: ' + add);
    }
    getRadioValue();
    
    var points = [];
    var chPoints = [];
    var selected_point = -1;
    var edges = [];
    var chEdges = [];

    function clear() {
        points = [];
        chPoints = [];
        selected_point = -1;
        edges = [];
        chEdges = [];
        drawAll();
    }

    function getCHEdges(chPoints) {
        var chEdges = [];
        for(var i = 1; i < chPoints.length; ++i) {
            var pt1 = chPoints[i-1];
            var pt2 = chPoints[i];
            chEdges.push([pt1, pt2]);
        }
        return chEdges;
    }

    function getAllEdges() {
        var a = [];
        function pushEdgeToA(e) { a.push(e); }
        edges.forEach(pushEdgeToA);
        chEdges.forEach(pushEdgeToA);
        return a;
    }

    document.getElementById('clear').addEventListener('click', function(evt) {
        clear();
    });

    function drawPoint(context, x, y, color) {
        if(!color) {
            color = 'black';
        }
        context.beginPath();
        context.arc(x, y, pointRadius, 0, 2 * Math.PI, false);
        context.fillStyle = color;
        context.fill();
    }

    function drawEdge(context, pt1, pt2, color) {
        if(!color) {
            color = 'black';
        }
        context.beginPath();
        context.moveTo(pt1.x, pt1.y);
        context.lineTo(pt2.x, pt2.y);
        context.lineWidth = 1;
        context.strokeStyle = color;
        context.stroke();
    }

    function drawAll() {
        contexts.forEach(function(context) {
            draw(context);
        });
    }
    function draw(context) {
        (function() {
            console.log('clearing');
            context.clearRect(0, 0, context.canvas.width, context.canvas.height);
        })();
        chPoints = Points.convexHull(points);
        chEdges = getCHEdges(chPoints);
        console.log('drawing');
        for(var i = 0; i < points.length; ++i) {
            var point = points[i];
            drawPoint(context, point.x, point.y, 'green');
        }
        for(var i = 0; i < chPoints.length; ++i) {
            var pt = points[chPoints[i]];
            drawPoint(context, pt.x, pt.y, 'blue');
        }
        for(var i = 0; i < edges.length; ++i) {
            var e = edges[i];
            var pt1 = points[e[0]];
            var pt2 = points[e[1]];
            drawEdge(context, pt1, pt2);
        }
        for(var i = 0; i < chEdges.length; ++i) {
            var e = chEdges[i];
            var pt1 = points[e[0]];
            var pt2 = points[e[1]];
            drawEdge(context, pt1, pt2);
        }
        if(selected_point > -1) {
            console.log('highlighting selected point');
            var point = points[selected_point];
            drawPoint(context, point.x, point.y, 'red');
        }
    }
    
    function getMousePos(canvas, evt) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    }

    function sqrDistance(a, b) {
        return Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2);
    }

    function findClickedPoint(p) {
        var threshold = Math.pow(pointRadius, 2) + clickBox;
        console.log('=== clicked point check')
        for(var i = 0; i < points.length; ++i) {
            var candidate = points[i];
            console.log('Candidate: (' + candidate.x + ',' + candidate.y + ')');
            var sqrDist = sqrDistance(p, candidate);
            console.log('Distance: ' + sqrDist);
            console.log('Threshold: ' + threshold);
            if(threshold > sqrDist) {
                console.log('===== FOUND');
                return i;
            }
        }
        console.log('===');
        return -1;
    }

    function removePoint(index) {
        var new_edges = [];
        for(var i = 0; i < edges.length; ++i) {
            var e = edges[i];
            if(e[0] === index || e[1] === index) {
                console.log('Deleting edge ' + i);
            } else {
                new_edges.push(e);
            }
        }
        edges = new_edges;
        points.splice(index, 1);
        if(selected_point === index) {
            selected_point = -1;
        }
    }

    function addPoint(p) {
        var clicked_point = findClickedPoint(p);
        console.log('Clicked point: ' + clicked_point);
        if(clicked_point > -1) {
            console.log('deleting point');
            removePoint(clicked_point);
        } else {
            points.push(p);
            Points.sortPoints(points);
        }
    }

    function addEdge(p) {
        var clicked_point = findClickedPoint(p);
        if(clicked_point > -1) {
            if(clicked_point === selected_point) {
                console.log('Unselecting point');
                selected_point = -1;
            } else if(selected_point === -1) {
                console.log('Selecting point');
                selected_point = clicked_point;
            } else {
                var new_edge = [selected_point, clicked_point];
                new_edge.sort(function(a,b) { return a - b; } );
                console.log('New edge: ' + new_edge);
                var found = -1;
                for(var i = 0; i < edges.length; ++i) {
                    var e = edges[i];
                    console.log('Old edge: ' + e);
                    if(new_edge[0] === e[0] && new_edge[1] === e[1]) {
                        console.log('Found edge');
                        found = i;
                        break;
                    }
                }
                if(found > -1) {
                    console.log('Deleting edge');
                    edges.splice(found, 1);
                } else {
                    console.log('=== CH check for ' + new_edge);
                    var pt1 = new_edge[0];
                    var pt2 = new_edge[1];
                    var onCH = false;
                    for(var i = 1; i < chPoints.length; ++i) {
                        var ch1 = chPoints[i-1];
                        var ch2 = chPoints[i];
                        if(pt1 === ch1 && pt2 === ch2 ||
                           pt1 === ch2 && pt2 ===ch1) {
                            console.log('Added edge on CH');
                            onCH = true;
                            break;
                        }
                    }
                    console.log('===');
                    if(!onCH) {
                        var a = Edges.crossesEdges(new_edge, edges, points);
                        if(a) {
                            var e = a[0];
                            var p = a[1];
                            console.log('Crosses edge: ' + e);
                            var p0 = points[e[0]];
                            var p1 = points[e[1]];
                            console.log('Between points: ' +
                                        pts(p0) + ' ' +
                                        pts(p1));
                            console.log('At point:     ' + pts(p));
                        } else {
                            console.log('Adding edge');
                            edges.push(new_edge);
                        }
                    }
                }
            }
        }            
    }

    function selectCHPoint(p) {
        var clicked_point = findClickedPoint(p);
        if(clicked_point > -1) {
            if(clicked_point === selected_point) {
                console.log('Unselecting point');
                selected_point = -1;
            } else if(selected_point === -1 &&
                      chPoints.indexOf(clicked_point) !== -1) {
                console.log('Selecting point ' + clicked_point);
                console.log(chPoints);
                selected_point = clicked_point;
            } else {
                console.log('Invalid point');
            }
        } else {
            console.log('No point clicked');
        }        
    }

    canvases.forEach(function(canvas) {
        canvas.addEventListener('click', function(evt) {
            getRadioValue();
            var p = getMousePos(canvas, evt);
            console.log('click at (' + p.x + ',' + p.y + ')');
            if(add === 'add_points') {
                addPoint(p);
            } else if(add === 'add_edges') {
                addEdge(p);
            } else if(add === 'select_ch_point') {
                selectCHPoint(p);
            } else {
                console.error('Invalid add_group value');
            }
            drawAll();
        });
    });

    var inputNodeList = document.querySelectorAll('input');
    for(var i = 0; i < inputNodeList.length; ++i) {
        var e = inputNodeList[i];
        e.addEventListener('click', function(evt) {
            selected_point = -1;
            drawAll();
        });
    }
})();
