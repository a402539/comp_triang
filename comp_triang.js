"use strict";
(function() {
    var pointRadius = 5;
    
    var canvas = document.getElementById('c');
    var context = canvas.getContext('2d');

    var add = null;
    function getRadioValue() {
        add = document.querySelector('input[name="add_group"]:checked').value;
        console.log('Radio value: ' + add);
    }
    getRadioValue();
    
    var points = [];
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
        var chPoints = Points.convexHull(points);
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

    function sortPoints() {
        points.sort(function(a,b) {
            return b.x - a.x;
        });
    }

    function sqrDistance(a, b) {
        return Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2);
    }

    function findClickedPoint(p) {
        var fudgeFactor = 10;
        var threshold = Math.pow(pointRadius, 2) + fudgeFactor;
        for(var i = 0; i < points.length; ++i) {
            var candidate = points[i];
            //console.log('Candidate: (' + candidate.x + ',' + candidate.y + ')');
            var sqrDist = sqrDistance(p, candidate);
            //console.log('Distance: ' + sqrDist);
            //console.log('Threshold: ' + threshold);
            if(threshold > sqrDist) {
                //console.log('===== FOUND');
                return i;
            }
        }
        return -1;
    }

    function addPoint(p) {
        var clicked_point = findClickedPoint(p);
        console.log('Clicked point: ' + clicked_point);
        if(clicked_point > -1) {
            console.log('deleting point');
            points.splice(clicked_point, 1);
        } else {
            points.push(p);
            sortPoints();
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
                    console.log('Adding edge');
                    edges.push(new_edge);
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
