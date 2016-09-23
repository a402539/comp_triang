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
        for(var i = 0; i < this.points.length; ++i) {
            this.labels[i] = null;
            other.labels[i] = null;
        }
        var next_label = 1;
        this.labels[this.selected_point] = next_label;
        other.labels[other.selected_point] = next_label++;
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
            var other_i = other_chPoints[(i + other_start) % other_chPoints.length];
            console.log('this_i:  ', this_i);
            console.log('other_i: ', other_i);
            if(this.labels[this_i]) {
                continue;
            } else {
                this.labels[this_i] = next_label;
                other.labels[other_i] = next_label++;
            }
        }
        console.log('This labels:  ', this.labels);
        console.log('Other labels: ', other.labels);
        //////////////////////////////////////////////////////////////////////
        // other labels
        // TODO
        return true;
    };
    
    return {create:pointSet};
})();
