"use strict";
var Heap = function(arr, cmpFn) {
    if(arr === undefined) {
        arr = [];
    }
    if(cmpFn === undefined) {
        cmpFn = cmpInc;
    }
    this.arr = arr;
    this.cmpFn = cmpFn;
    this.build();
};

Heap.parent = function(i) {
    return Math.floor((i-1)/2);
}
Heap.left = function(i) {
    return 2*i + 1;
}
Heap.right = function(i) {
    return 2*i + 2;
}

Heap.prototype.size = function() {
    return this.arr.length;
};

Heap.prototype.heapify = function(i) {
    if(i === undefined) {
        i = 0;
    }
    var len = this.arr.length;
    while(i < len) {
        var ival = this.arr[i];
        var l = Heap.left(i);
        var r = Heap.right(i);
        var best = i;
        var bestval = ival;
        if(l < len && this.cmpFn(bestval, this.arr[l]) > 0) {
            best = l;
            bestval = this.arr[l];
        }
        if(r < len && this.cmpFn(bestval, this.arr[r]) > 0) {
            best = r;
            bestval = this.arr[r];
        }
        if(best !== i) {
            this.arr[i] = this.arr[best];
            this.arr[best] = ival;
            i = best;
        } else {
            return;
        }
    }
};

Heap.prototype.build = function() {
    var len = this.arr.len;
    for(var i = Math.floor(len/2); i >= 1; --i) {
        this.heapify(i);
    }
};

Heap.prototype.insert = function(x) {
    this.arr.push(x);
    var i = this.arr.length - 1;
    while(i > 0) {
        var p = Heap.parent(i);
        var pval = this.arr[p];
        if(this.cmpFn(pval, x) > 0) {
            this.arr[p] = x;
            this.arr[i] = pval;
            i = p;
        } else {
            return;
        }
    }
};

Heap.prototype.pop = function() {
    var ret = this.arr[0];
    var len = this.arr.length;
    this.arr[0] = this.arr[len - 1];
    this.arr.pop();
    this.heapify();
    return ret;
};

Heap.prototype.print = function() {
    console.log(this.arr);
};

Heap.test = function() {
    var h = new Heap();
    h.insert(3);
    h.insert(2);
    h.insert(4);
    h.insert(5);
    h.insert(1);
    h.print();
    while(h.size() > 0) {
        console.log('Pop: ' + h.pop());
        h.print();
    }
}

