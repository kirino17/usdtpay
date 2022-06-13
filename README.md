# usdtpay
TRC20 USDT/USDC payment gateway, 数字货币 TRC20 USDT/USDC 支付网关。

# desc
入网级节点开发，自带支付模板, 支持pc/移动/dapp三端拉起支付, 无码池归集/零手续费/直充到账/即时广播回调。

Network-level node development, comes with payment template, supports pc/mobile/dapp three-terminal pull-up payment, no-code pool collection/zero handling fee/direct charge to account/instant broadcast callback.

# install
```bash
pnpm install
```

# run
```bash
pnpm start
```

# development guide

    支付网关的接入说明

## 接收链上交易通知

    对应方法:

    ```typescript
        // http://*/transaction
    ```