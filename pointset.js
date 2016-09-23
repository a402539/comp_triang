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
        };
        this.clear();
    }
    pointSet.prototype.allEdges = function() {
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
            this.chEdges.push([pt1, pt2]);
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
        var points = this.points;
        var selected_point = this.selected_point;
        var new_edges = [];
        for(var i = 0; i < edges.length; ++i) {
            var e = edges[i];
            if(e[0] === index || e[1] === index) {
                console.log('Deleting edge ' + i);
            } else {
                new_edges.push(e);
            }
        }
        this.edges = new_edges;
        points.splice(index, 1);
        if(selected_point === index) {
            this.selected_point = -1;
        }
    };
    pointSet.prototype.removeEdge = function(index) {
        this.edges.splice(index, 1);
    };
    pointSet.prototype.getNeighbours = function(p) {
        var edges = this.edges;
        var points = this.points;
        var point = points[p];
        var neighbours = [];
        for(var i = 0; i < edges.length; ++i) {
            var e = edges[i];
            var ei = e.indexOf(p);
            if(ei !== -1) {
                var q = (ei + 1) % 2;
                neighbours.push(q);
            }
        }
        neighbours.sort(function(a,b) {
            var pta = points[a];
            //          pta
            //          /|  da = Math.sqrt(dxa*dxa + dya*dya)
            //         / |
            //     da /  |  dya = Math.abs(pta.y - point.y)
            //       / ta|
            //      /_)__|
            // point  dxa = Math.abs(pta.x - point.x)
            //               ta = Math.asin(dya / da)
            var dxa = Math.abs(pta.x - point.x);
            var dya = Math.abs(pta.y - point.y);
            var da = Math.sqrt(dxa*dxa + dya*dya);
            var ta = Math.asin(dya / da);
            
            // And similarly for ptb.
            var ptb = points[b];
            var dxb = Math.abs(ptb.x - point.x);
            var dyb = Math.abs(ptb.y - point.y);
            var db = Math.sqrt(dxb*dxb + dyb*dyb);
            var tb = Math.asin(dyb / db);

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
        console.log('Initial labels');
        console.log('This labels:  ', this.labels);
        console.log('Other labels: ', other.labels);
        console.log('this.chPoints:  ', this.chPoints);
        console.log('other.chPoints: ', other.chPoints);
        console.log('this_chPoints:  ', this_chPoints);
        console.log('other_chPoints: ', other_chPoints);
        var this_start = this_chPoints.indexOf(this.selected_point);
        var other_start = other_chPoints.indexOf(other.selected_point);
        console.log('this_start:  ', this_start);
        console.log('other_start: ', other_start);
        for(var i = 1; i < this_chPoints.length; ++i) {
            console.log('i: ', i);
            console.log('this_chPoints.length: ', this_chPoints.length);
            var this_i = this_chPoints[(i + this_start) % this_chPoints.length];
            var other_i = other_chPoints[(i + other_start) %
                                         other_chPoints.length];
            console.log('this_i:  ', this_i);
            console.log('other_i: ', other_i);
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
                var other_neighbours = other.getNeighbours(i);
                console.log('this_neighbours:  ', this_neighbours);
                console.log('other_neighbours: ', other_neighbours);
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
                return {x: xy[0], y: xy[1]};
            }
        }).filter(function(point) { return point !== undefined; });
        this.edges = parts[1].split('_').map(function(s) {
            if(s) {
                console.log('Restoring: ', s);
                return s.split(',');
            }
        }).filter(function(point) { return point !== undefined; });
        this.convexHull();
    };
    
    return {create:pointSet};
})();
