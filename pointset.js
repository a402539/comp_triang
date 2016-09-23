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
    pointSet.prototype.removePoint = function(index) {
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
    };
    pointSet.prototype.removeEdge = function(index) {
        this.edges.splice(index, 1);
    };
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
            var pta = points[a];
            //          pta
            //          /|  
            //         / |
            //        /  |  dya = Math.abs(pta.y - point.y)
            //       / ta|
            //      /_)__|
            // point  dxa = Math.abs(pta.x - point.x)
            //               ta = Math.atan2(dya, dxa)
            var dxa = Math.abs(pta.x - point.x);
            var dya = Math.abs(pta.y - point.y);
            var ta = Math.atan2(dya, dxa);
            
            // And similarly for ptb.
            var ptb = points[b];
            var dxb = Math.abs(ptb.x - point.x);
            var dyb = Math.abs(ptb.y - point.y);
            var tb = Math.atan2(dyb, dxb);

            return ta - tb;
        });
        return neighbours;
    };
    pointSet.prototype.checkCompatible = function(other) {
        if(this.selected_point === -1 || other.selectedPoint === -1) {
            console.log('Check: Must select a point in both sets');
            return false;
        }
        if(this.chPoints.indexOf(this.selected_point) === -1 ||
           other.chPoints.indexOf(other.selected_point) === -1) {
            console.log('Check: Must select a _CH_ point in both sets');
            console.log('this.chPoints:  ', this.chPoints,
                        ', selected', this.selected_point);
            console.log('other.chPoints: ', other.chPoints,
                        ', selected', other.selected_point);
            return false;
        }
        if(this.points.length !== other.points.length) {
            console.log('Check: Different number of points');
            return false;
        }
        if(this.chPoints.length !== other.chPoints.length) {
            console.log('Check: Different number of _CH_ points');
            return false;
        }
        //////////////////////////////////////////////////////////////////////
        // Initial labels
        this.labels = [];
        other.labels = [];
        var this_to_other = [];
        for(var i = 0; i < this.points.length; ++i) {
            this.labels[i] = null;
            other.labels[i] = null;
            this_to_other[i] = null;
        }
        var next_label = 1;
        this.labels[this.selected_point] = next_label;
        other.labels[other.selected_point] = next_label++;
        this_to_other[this.selected_point] = other.selected_point;
        //////////////////////////////////////////////////////////////////////
        // ch labels
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
        var this_chPoints = removeDuplicates(this.chPoints);
        var other_chPoints = removeDuplicates(other.chPoints);
        var this_start = this_chPoints.indexOf(this.selected_point);
        var other_start = other_chPoints.indexOf(other.selected_point);
        for(var i = 1; i < this_chPoints.length; ++i) {
            var this_i = this_chPoints[(i + this_start) % this_chPoints.length];
            var other_i = other_chPoints[(i + other_start) %
                                         other_chPoints.length];
            if(this.labels[this_i]) {
                continue;
            } else {
                this.labels[this_i] = next_label;
                other.labels[other_i] = next_label++;
                this_to_other[this_i] = other_i;
            }
        }
        console.log('This labels:  ', this.labels);
        console.log('Other labels: ', other.labels);
        console.log('Mapping:      ', this_to_other);
        if(this.labels.indexOf(null) === -1 &&
           other.labels.indexOf(null) === -1) {
            return true;
        }
        //////////////////////////////////////////////////////////////////////
        // other labels
        var done = [];
        for(var i = 0; i < this.points.length; ++i) {
            done.push(false);
        }
        while(done.indexOf(false) !== -1) {
            var first_index = done.indexOf(false);
            var last_index = done.lastIndexOf(false);
            for(var i = first_index; i <= last_index; ++i) {
                if(done[i]) continue;
                if(!this.labels[i]) continue;
                if(this_to_other[i] === null) {
                    console.error('Missing mapping: ', i);
                    console.error('this_to_other:   ', this_to_other);
                    console.error('this.labels:     ', this.labels);
                    console.error('other.labels:    ', other.labels);
                    return false;
                }
                var other_i = this_to_other[i];
                var this_neighbours = this.getNeighbours(i);
                var other_neighbours = other.getNeighbours(other_i);
                var this_labels = this.labels;
                console.log('i: ', i, ', other_i: ', other_i);
                console.log('this_neighbours:  ', this_neighbours,
                            'labeled: ', this_neighbours.map(function(p) {
                                return this_labels[p];
                            }));
                console.log('other_neighbours: ', other_neighbours,
                            'labeled: ', other_neighbours.map(function(p) {
                                return other.labels[p];
                            }));
                return false;
            }
        }
        return true;
    };
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
    
    return {create:pointSet};
})();
