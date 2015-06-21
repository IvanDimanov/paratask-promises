# Paratask - Node.js Parallel Tasks Manager

## Comparison tests
You can check current results by comparing 'async.parallel', 'process.nextTick', and our 'paratask'.

### Heavy calculation:

```shell
node async_heavy_test.js
```
```shell
node process_nextTick_heavy_test.js
```
```shell
node paratask_heavy_test.js
```

### Light calculation:

```shell
node async_light_test.js
```
```shell
node process_nextTick_light_test.js
```
```shell
node paratask_light_test.js
```

### Please note that comparing by 'setTimeout()' is not really "working hard" method but still available as:

```shell
node async_timeout_test.js
```
```shell
node process_nextTick_timeout_test.js
```
```shell
node paratask_timeout_test.js
```