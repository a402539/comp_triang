"use strict";
var Points = (function() {
    //////////////////////////////////////////////////////////////////////
    // Convex Hull
    
    function isLeftTurn(p1, p2, p3) {
        var x1 = p2.x - p1.x;
        var x2 = p3.x - p1.x;
        var y1 = p2.y - p1.y;
        var y2 = p3.y - p1.y;
        return 0 > (x1 * y2 - x2 * y1);
    }
    function halfHull(points, left) {
        if(points.length < 3) {
            return points;
        }
        var stack = [];
        for(var i = 0; i < points.length; ++i) {
            var p = points[i];
            while(stack.length > 1 &&
                  isLeftTurn(stack[stack.length-2],
                             stack[stack.length-1], p) == left) {
                stack.pop();
            }
            stack.push(p);
        }
        return stack;
    }
    function convexHull(points) {
        console.log('computing convex hull');
        var chPoints = [];
        halfHull(points, true).forEach(function(pt) {
            chPoints.push(pt);
        });
        halfHull(points, false).reverse().forEach(function(pt) {
            chPoints.push(pt);
        });
        return chPoints;
    }

    //////////////////////////////////////////////////////////////////////
    // Plane sweep
    Array.prototype.isSorted = function(cmpFn) {
        if(cmpFn === undefined) {
            cmpFn = cmpInc;
        }
        var len = this.length;
        for(var i = 1; i < len; ++i) {
            if (cmpFn(this[i-1],this[i]) < 0) {
                return false;
            }
        }
        return true;
    };
    function cmpIncX(a,b) {
        return a.x - b.x;
    }
    function cmpIncY(a,b) {
        return a.y - b.y;
    }
    function planeSweep(points, fn, cmpFn) {
        if(cmpFn === undefined) {
            cmpFn = cmpIncX;
        }
        if(!points.isSorted(cmpFn)) {
            points.sort(cmpFn);
        }
        points.forEach(fn);
    }

    //////////////////////////////////////////////////////////////////////
    // Voronoi
    function voronoi(points) {
        var q = Heap(points.slice(0), cmpIncY);
        var output = [];
        // TODO
        return output;
    }

    return {convexHull:convexHull, voronoi:voronoi};
})();
