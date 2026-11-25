---
title: 折半查找
module: searching
order: 2
algorithm: binary-search
summary: 只适用于有序顺序表，每次取中点比较，把查找区间折半。
timeComplexity: O(log n)
spaceComplexity: O(1)
tags: [折半查找, 二分查找, 有序表]
popular: true
---

## 算法原理

折半查找（二分查找）要求表**有序**且**顺序存储**。它维护一个查找区间 `[low, high]`，每次取中点 `mid = (low + high) / 2`：

- 若 `a[mid] == k`，命中返回 `mid`；
- 若 `k < a[mid]`，去左半 `[low, mid-1]`；
- 若 `k > a[mid]`，去右半 `[mid+1, high]`。

每次比较都把区间缩小一半，因此效率很高。

## 复杂度

- **时间复杂度**：$O(\log n)$。
- **空间复杂度**：$O(1)$。

## 动手观察

输入升序序列和查找值，观察 `low`、`high`、`mid` 三个指针如何定位，查找区间每一步折半缩小。
