"use strict";
var Points = (function() {
    // A point is any object with x and y values, such as:
    // {x: 0, y: 0}
    
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
        var stack = [];
        if(points.length < 3) {
            for(var i = 0; i < points.length; ++i) {
                stack.push(i);
            }
            return stack;
        }
        for(var i = 0; i < points.length; ++i) {
            var p = points[i];
            while(stack.length > 1 &&
                  isLeftTurn(points[stack[stack.length-2]],
                             points[stack[stack.length-1]], p) == left) {
                stack.pop();
            }
            stack.push(i);
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
    function sortPoints(points, cmpFn) {
        if(cmpFn === undefined) {
            cmpFn = cmpIncX;
        }
        if(!points.isSorted(cmpFn)) {
            points.sort(cmpFn);
        }
    }
    function planeSweep(points, fn, cmpFn) {
        sortPoints(points, cmpFn);
        points.forEach(fn);
    }
    function toString(point) {
        return '(' + point.x + ',' + point.y + ')';        
    }
    return {isLeftTurn:isLeftTurn,
            convexHull:convexHull,
            cmpIncX:cmpIncX,
            cmpIncY:cmpIncY,
            sortPoints:sortPoints,
            planeSweep:planeSweep,
            toString:toString};
})();
