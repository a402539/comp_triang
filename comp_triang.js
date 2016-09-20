"use strict";
(function() {
    // configuration
    var pointRadius = 5;
    var clickBox = 60;
    
    var canvas = document.getElementById('c');
    var context = canvas.getContext('2d');

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

    function clear() {
        points = [];
        selected_point = -1;
        edges = [];
        draw();
    }

    document.getElementById('clear').addEventListener('click', function(evt) {
        clear();
    });

    function drawPoint(context, x, y, color) {
        context.beginPath();
        context.arc(x, y, pointRadius, 0, 2 * Math.PI, false);
        context.fillStyle = color;
        context.fill();
    }

    function drawEdge(context, pt1, pt2) {
        context.beginPath();
        context.moveTo(pt1.x, pt1.y);
        context.lineTo(pt2.x, pt2.y);
        context.lineWidth = 1;
        context.stroke();
    }

    function draw() {
        (function() {
            console.log('clearing');
            context.clearRect(0, 0, canvas.width, canvas.height);
        })();
        chPoints = Points.convexHull(points);
        console.log('drawing');
        for(var i = 0; i < points.length; ++i) {
            var point = points[i];
            drawPoint(context, point.x, point.y, 'green');
        }
        for(var i = 1; i < chPoints.length; ++i) {
            var pt1 = chPoints[i-1];
            var pt2 = chPoints[i];
            if(i == 2) {
                drawPoint(context, pt1.x, pt1.y, 'blue');
            }
            drawPoint(context, pt2.x, pt2.y, 'blue');
            drawEdge(context, pt1, pt2);
        }
        for(var i = 0; i < edges.length; ++i) {
            var e = edges[i];
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
                    var pt1 = points[new_edge[0]];
                    var pt2 = points[new_edge[1]];
                    console.log('=== CH check');
                    var pts = Points.toString;
                    console.log('pt1: ' + pts(pt1) + ', pt2: ' + pts(pt2));
                    var onCH = false;
                    for(var i = 1; i < chPoints.length; ++i) {
                        var ch1 = chPoints[i-1];
                        var ch2 = chPoints[i];
                        console.log('ch1: ' + pts(ch1) + ', ch2: ' + pts(ch2));
                        if(pt1 === ch1 && pt2 === ch2 ||
                           pt1 === ch2 && pt2 ===ch1) {
                            console.log('Added edge on CH');
                            onCH = true;
                            break;
                        }
                    }
                    console.log('===');
                    if(!onCH) {
                        var addEdge = true;
                        var a = Edges.crossesEdges(new_edge, edges, points);
                        if(a) {
                            addEdge = false;
                            var e = a[0];
                            var p = a[1];
                            console.log('Crosses edge: ' + e);
                            var p0 = points[e[0]];
                            var p1 = points[e[1]];
                            console.log('Between points: ' +
                                        pts(p0) + ' ' +
                                        pts(p1));
                            console.log('At point:     ' + pts(p));
                            
                            if(p.x === p0.x && p.y === p0.y ||
                               p.x === p1.x && p.y === p1.y) {
                                console.log('Intersection at endpoint');
                                addEdge = true;
                            }
                        }
                        if(addEdge) {
                            console.log('Adding edge');
                            edges.push(new_edge);
                        }
                    }
                }
            }
        }            
    }

    canvas.addEventListener('click', function(evt) {
        getRadioValue();
        var p = getMousePos(canvas, evt);
        console.log('click at (' + p.x + ',' + p.y + ')');
        if(add === 'add_points') {
            addPoint(p);
        } else if(add === 'add_edges') {
            addEdge(p);
        } else {
            console.error('Invalid add_group value');
        }
        draw();
    });
})();
