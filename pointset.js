"use strict";
var PointSet = (function() {
    function pointSet(canvas) {
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        this.clear = function() {
            this.points = [];
            this.chPoints = [];
            this.selected_point = -1;
            this.edges = [];
            this.chEdges = [];
            this.labels = [];
        };
        this.clear();
    }
    pointSet.prototype.addPoint = function(p) {
        var points_copy = this.points.slice(0);
        points_copy.push(p);
        Points.sortPoints(points_copy);
        var i = points_copy.indexOf(p);
        for(var j = 0; j < this.edges.length; ++j) {
            var e = this.edges[j];
            if(e[0] >=i) e[0] = e[0] + 1;
            if(e[1] >=i) e[1] = e[1] + 1;
        }
        this.points.push(p);
        Points.sortPoints(this.points);
        this.convexHull();
    };
    pointSet.prototype.hasEdge = function(p, q) {
        var new_edge = [p, q];
        new_edge.sort(function(a,b) { return a - b; } );
        console.log('New edge: ' + new_edge);
        var found = -1;
        for(var i = 0; i < this.edges.length; ++i) {
            var e = this.edges[i];
            console.log('Old edge: ' + e);
            if(new_edge[0] === e[0] && new_edge[1] === e[1]) {
                console.log('Found edge');
                found = i;
                break;
            }
        }
        return found;
    };
    pointSet.prototype.addEdge = function(p, q) {
        if(this.hasEdge(p,q) > -1) {
            return;
        }
        var new_edge = [p, q];
        new_edge.sort(function(a,b) { return a - b; } );
        console.log('=== CH check for ' + new_edge);
        var pt1 = new_edge[0];
        var pt2 = new_edge[1];
        var onCH = false;
        for(var i = 1; i < this.chPoints.length; ++i) {
            var ch1 = this.chPoints[i-1];
            var ch2 = this.chPoints[i];
            if(pt1 === ch1 && pt2 === ch2 ||
               pt1 === ch2 && pt2 ===ch1) {
                console.log('Added edge on CH');
                    onCH = true;
                break;
            }
        }
        console.log('===');
        if(!onCH) {
            var a = Edges.crossesEdges(new_edge, this.edges, this.points);
            if(a) {
                var e = a[0];
                var p = a[1];
                console.log('Crosses edge: ' + e);
                var p0 = this.points[e[0]];
                var p1 = this.points[e[1]];
                console.log('Between points: ', p0, ' ', p1);
                console.log('At point:     ' , p);
            } else {
                console.log('Adding edge');
                this.edges.push(new_edge);
                this.convexHull();
            }
        }
    };
    pointSet.prototype.getAllEdges = function() {
        var a = [];
        function pushEdgeToA(e) { a.push(e); }
        this.edges.forEach(pushEdgeToA);
        this.chEdges.forEach(pushEdgeToA);
        return a;
    };
    pointSet.prototype.convexHull = function() {
        this.chPoints = Points.convexHull(this.points);
        this.chEdges = [];
        for(var i = 1; i < this.chPoints.length; ++i) {
            var pt1 = this.chPoints[i-1];
            var pt2 = this.chPoints[i];
            if(pt1 !== pt2) {
                this.chEdges.push([pt1, pt2]);
            }
        }
    };
    pointSet.prototype.selectPoint = function(p) {
        this.selected_point = p;
    };
    pointSet.prototype.unselectPoint = function() {
        this.selectPoint(-1);
    };
    pointSet.prototype.movePoint = function(index, to_point) {
        var neighbours = [];
        for(var i = 0; i < this.edges.length; ++i) {
            var e = this.edges[i];
            if(e.indexOf(index) !== -1) {
                if(e[0] === index) {
                    neighbours.push(e[1]);
                } else {
                    neighbours.push(e[0]);
                }
            }
        }
        this.removePoint(index, true);
        this.addPoint(to_point);
        var new_index = this.points.indexOf(to_point);
        for(var i = 0; i < neighbours.length; ++i) {
            var neighbour = neighbours[i];
            if(neighbour > index && neighbour <= new_index) {
                neighbour -= 1;
            }
            if(neighbour < index && neighbour >= new_index) {
                neighbour += 1;
            }
            this.addEdge(new_index, neighbour);
        }
    };
    pointSet.prototype.removePoint = function(index, noCHcheck) {
        var edges = this.edges;
        var selected_point = this.selected_point;
        var new_edges = [];
        for(var i = 0; i < edges.length; ++i) {
            var e = edges[i];
            if(e.indexOf(index) !== -1) {
                console.log('Deleting edge ' + i);
            } else if(e[0] > index || e[1] > index) {
                var e0 = e[0];
                var e1 = e[1];
                if(e0 > index) e0 = e0 - 1;
                if(e1 > index) e1 = e1 - 1;
                if(e0 < e1) {
                    new_edges.push([e0, e1]);
                }
            } else {
                new_edges.push(e);
            }
        }
        this.edges = new_edges;
        this.points.splice(index, 1);
        if(selected_point === index) {
            this.selected_point = -1;
        }
        // Remove edges that are now on the convex hull
        if(!noCHcheck) {
            this.convexHull();
            edges = this.edges;
            new_edges = [];
            for(var i = 0; i < edges.length; ++i) {
                var e = edges[i];
                if(this.chPoints.indexOf(e[0]) !== -1 &&
                   this.chPoints.indexOf(e[1]) !== -1) {
                    continue;
                } else {
                    new_edges.push(e);
                }
            }
            this.edges = new_edges;
        }
    };
    pointSet.prototype.removeEdge = function(index) {
        this.edges.splice(index, 1);
    };
    function getCircularAngle(p,q) {
        //       q
        //      /|  
        //     / |
        //    /  |  dy = q.y - p.y
        //   / t |
        //  /_)__|
        // p  dx = q.x - p.x
        var dy = q.y - p.y;
        var dx = q.x - p.x;
        var t = Math.atan2(dy, dx);
        return t;
    }
    function removeDuplicates(a) {
        var keys = [];
        var ob = {};
        a.forEach(function(x) {
            if(ob[x]) {
                return;
            } else {
                keys.push(x);
                ob[x] = true;
            }
        });
        return keys;
    }
    pointSet.prototype.getNeighbours = function(p) {
        var edges = this.getAllEdges();
        var points = this.points;
        var point = points[p];
        var neighbours = [];
        console.log('Finding neighbours for: ', p);
        for(var i = 0; i < edges.length; ++i) {
            var e = edges[i];
            var ei = e.indexOf(p);
            if(ei !== -1) {
                console.log('Found: ', e);
                var q = e[(ei + 1) % 2]
                neighbours.push(q);
            }
        }
        neighbours.sort(function(a,b) {
            var ta = getCircularAngle(point, points[a]);
            var tb = getCircularAngle(point, points[b]);
            return ta - tb;
        });
        return neighbours;
    };
    pointSet.prototype.isFullyLabeled = function() {
        return this.labels.indexOf(null) === -1;
    }
    pointSet.prototype.clearLabels = function() {
        this.labels = [];
        for(var i = 0; i < this.points.length; ++i) {
            this.labels[i] = null;
        }
    };
    function labelCHPoints(left, right) {
        left.clearLabels();
        right.clearLabels();
        var left_to_right = [];
        
        var left_chPoints = removeDuplicates(left.chPoints);
        var right_chPoints = removeDuplicates(right.chPoints);
        
        var left_start = left_chPoints.indexOf(left.selected_point);
        var right_start = right_chPoints.indexOf(right.selected_point);
        
        for(var i = 0; i < left_chPoints.length; ++i) {
            var left_i = left_chPoints[(i + left_start) % left_chPoints.length];
            var right_i = right_chPoints[(i + right_start) %
                                         right_chPoints.length];
            if(left.labels[left_i]) {
                continue;
            } else {
                left.labels[left_i] = i + 1;
                right.labels[right_i] = i + 1;
                left_to_right[left_i] = right_i;
            }
        }
        return left_to_right;
    };
    function labelInternalPoints(left, right, left_to_right) {
        var next_label = removeDuplicates(left.chPoints).length + 1;
        for(var left_i = 0; left_i < left.points.length; ++left_i) {
            if(!left.labels[left_i]) {
                console.error('Unlabeled vertex: ', left_i);
                console.error('Labels: ', left.labels);
                return 'reached unlabeled vertex.';
            }
            if(left_to_right[left_i] === null) {
                console.error('Missing mapping: ', left_i);
                console.error('left_to_right:   ', left_to_right);
                console.error('left.labels:     ', left.labels);
                console.error('right.labels:    ', right.labels);
                return 'missing mapping';
            }
            var right_i = left_to_right[left_i];
            var left_neighbours = left.getNeighbours(left_i);
            var right_neighbours = right.getNeighbours(right_i);
            if(left_neighbours.length !== right_neighbours.length) {
                return ['Vertex ' + left.labels[left_i] +
                        ' has differing # of neighbours', left_i, right_i];
            }
            // Left stuff
            var left_neighbours_labels = left_neighbours.map(function(p) {
                return left.labels[p];
            });
            while(left_neighbours_labels[0] === null) {
                rotateArray(left_neighbours);
                rotateArray(left_neighbours_labels);
            }
            // Right stuff
            var right_neighbours_labels = right_neighbours.map(function(p) {
                return right.labels[p];
            });
            var count = 0;
            while(left_neighbours_labels[0] !== right_neighbours_labels[0]) {
                rotateArray(right_neighbours);
                rotateArray(right_neighbours_labels);
                if(++count >= left_neighbours.length) {
                    console.log('left_neighbours:  ', left_neighbours,
                                'labeled: ', left_neighbours_labels);
                    console.log('right_neighbours: ', right_neighbours,
                                'labeled: ', right_neighbours_labels);
                    return ['neighbours of vertex ' + left.labels[left_i] +
                            ' don\'t match', left_i, right_i];
                }
            }
            console.log('left_i: ', left_i, ', right_i: ', right_i);
            console.log('left_neighbours:  ', left_neighbours,
                            'labeled: ', left_neighbours_labels);
            console.log('right_neighbours: ', right_neighbours,
                        'labeled: ', right_neighbours_labels);
            for(var j = 1; j < left_neighbours.length; ++j) {
                var left_label = left_neighbours_labels[j];
                var right_label = right_neighbours_labels[j];
                
                if(left_label === null) {
                    if(right_label === null) {
                        left.labels[left_neighbours[j]] = next_label;
                        right.labels[right_neighbours[j]] = next_label++;
                        left_to_right[left_neighbours[j]] = right_neighbours[j];
                    } else {
                            return ['Found vertex ' + 
                                    right_neighbours_labels[j] + 
                                    ' in right graph, not labeled in left',
                                    left_neighbours[j], right_neighbours[j]];
                    }
                } else if(right_neighbours_labels[j] === null) {
                    return ['Found vertex ' + 
                            left_neighbours_labels[j] + 
                            ' in left graph, not labeled in right',
                            left_neighbours[j], right_neighbours[j]];
                } else if(left_label !== right_label) {
                    return ['Label mistmatch!',
                            left_neighbours[j], right_neighbours[j]];
                }
            }
        }
        return true;
    }
    pointSet.checkCompatible = function(left, right) {
        if(left.selected_point === -1 || right.selectedPoint === -1) {
            return 'must select a point in both sets';
        }
        if(left.chPoints.indexOf(left.selected_point) === -1 ||
           right.chPoints.indexOf(right.selected_point) === -1) {
            console.log('left.chPoints:  ', left.chPoints,
                        ', selected', left.selected_point);
            console.log('right.chPoints: ', right.chPoints,
                        ', selected', right.selected_point);
            return 'must select a CH point in both sets';
        }
        if(left.points.length !== right.points.length) {
            return 'different number of points';
        }
        if(left.chPoints.length !== right.chPoints.length) {
            return 'different number of CH points';
        }
        var left_to_right = labelCHPoints(left, right);
        
        if(left.isFullyLabeled() && right.isFullyLabeled()) {
            return true;
        }
        return labelInternalPoints(left, right, left_to_right);
    };
    function rotateArray(arr) {
        arr.push(arr.shift());
        return arr;
    }
    pointSet.prototype.toString = function() {
        var s = '';
        var points = this.points;
        var edges = this.edges;
        this.points.forEach(function(point) {
            if(point !== points[0]) {
                s += '_';
            }
            s += '' + point.x + ',' + point.y;
        });
        s += ';';
        this.edges.forEach(function(edge) {
            if(edge !== edges[0]) {
                s += '_';
            }
            s += '' + edge[0] + ',' + edge[1];
        });
        s += ';' + this.selected_point;
        return s;
    };
    pointSet.prototype.fromString = function(s) {
        this.clear();
        if(!s) {
            return;
        }
        if(s.indexOf('|') !== -1) {
            s = s.split('|')[0];
        }
        var parts = s.split(';');
        this.points = parts[0].split('_').map(function(s) {
            if(s) {
                console.log('Restoring: ', s);
                var xy = s.split(',');
                return {x: parseFloat(xy[0]),
                        y: parseFloat(xy[1])};
            }
        }).filter(function(point) { return point !== undefined; });
        function parseIntBaseTen(s) {
            return parseInt(s, 10);
        }
        this.edges = parts[1].split('_').map(function(s) {
            if(s) {
                console.log('Restoring: ', s);
                return s.split(',').map(parseIntBaseTen);
            }
        }).filter(function(point) { return point !== undefined; });
        var radix = 10;
        this.selected_point = parseIntBaseTen(parts[2]);
        this.convexHull();
    };
    pointSet.prototype.triangulate = function() {
        for(var i = 0; i < this.points.length; ++i) {
            for(var j = i + 1; j < this.points.length; ++j) {
                this.addEdge(i,j);
            }
        }
    };
    
    return pointSet;
})();
