# usdtpay
TRC20 USDT/USDC payment gateway, 数字货币 TRC20 USDT/USDC 支付网关。

# desc
入网级节点开发，自带支付模板, 支持pc/移动/dapp三端拉起支付, 只要一个钱包地址即可收款，无需密钥！ 无码池归集/零手续费/直充到账/即时广播回调。

Network-level node development, comes with payment templates, supports pc/mobile/dapp three-terminal pull-up payment, only needs a wallet address to receive payment, no privatekey is required! No-code pool collection/zero handling fee/direct recharge/instant broadcast callback.
# install
```bash
npm install pnpm --save -g
pnpm install esno --save -g
pnpm install
```

# run
```bash
pnpm start
```

# transaction notice
    接收链上交易通知, 创建一台服务器支持并接收处理 POST /transaction 请求如:

    ```typescript
        let app = express();

        const port = 9200;

        app.use(express.json());

        //接收并处理交易通知
        app.post('/transaction', (req, res) => {
            try {
                let transaction = req.body as TransactionBody;
                console.log("收到新的交易订单: ", transaction);
            }
            catch(e){
                console.log('/transaction error: ', e);
            }
            res.send({ status: true });
        });

    ```

    TransactionBody 定义如下: 

    ```typescript
        /**
         * 回传交易信息
         */
        interface TransactionBody {
            //合约地址
            contract: string;

            //发送者
            from: string;

            //发送金额
            value: string;

            //交易hash
            txHash: string;

            //订单信息(如果有)
            order?: {
                //收款id
                id: string;

                //订单金额
                amount: number;

                //自定义订单id
                orderid: string;

                //创建时间:
                created_at: number;

                //订单自定义参数(如果有):
                params?: any;
            }
        }
    ```

# update balance
    获取支付网关当前钱包余额

    ```typescript
        async function balanceOf(){
            try {
                //假设支付网关为 http://localhost:9110
                let resp = await axios.get(`http://localhost:9110/balance`);
                let object:BalanceBody = resp.data as BalanceBody;
                console.log(object);
                return parseInt(object.balance) / Math.pow(10,object.decimal);
            }
            catch(e){
                console.log('balanceOf error: ', e);
            }
            return 0;
        }
    ```

# create order
    创建支付订单

    ```typescript
        /**
         * 发送支付请求
         * 
         * @param name 商品名称
         * @param desc 商品描述
         * @param amount 支付金额
         * @param orderid 自定义订单id(必须唯一)
         * @param snapshot 商品图片
         * @param params 订单参数
         * @returns 请求成功返回支付页面地址。
         */
        async function requestPay(name: string, desc: string, amount: number, orderid: string, snapshot?: string, params?: any): Promise<string> {
            try {
                let body:createPayBody = {
                    amount,
                    orderid,
                    params:{
                        name,
                        desc,
                        snapshot: snapshot || '',
                        other: params
                    }
                };
                //假设支付网关为 http://localhost:9110
                let resp = await axios.post(`http://localhost:9110/order`, body);
                console.log(resp.data);
                let result = resp.data as createPayResultBody;
                console.log('创建订单', resp.data);
                return result.frontend;
            }
            catch(e){
                console.log('requestPay error: ', e);
            }
            return '';
        }
    ```

# order page
    获取生成的订单支付页面

    ```typescript
        /**
         * 获取订单支付页面
         * @param orderid 订单id
         */
        async function updatePay(orderid: string): Promise<string>{
            try {
                //假设支付网关为 http://localhost:9110
                let resp = await axios.get(`http://localhost:9110/pay?order=${orderid}`);
                return resp.data;
            }
            catch(e){
                console.log('checkPay error: ', e);
            }
            //发生异常的时候返回true, 返回false时前端支付页面会自动关闭
            return '';
        }
    ```

# check order
    检查订单是否已处理完成

    ```typescript
        /**
         * 检查给定订单是否有效
         * @param orderid 订单id
         */
        async function checkPay(orderid: string): Promise<boolean>{
            try {
                let resp = await axios.get(`${paymentGatewayUrl}/check?order=${orderid}`);
                let result = resp.data;
                console.log('订单检查', resp.data);
                return result.status;
            }
            catch(e){
                console.log('checkPay error: ', e);
            }
            //发生异常的时候返回true, 返回false时前端支付页面会自动关闭
            return true;
        }
    ```

# samples
    请通过邮箱: heimao117@gmail.com 或 kirino17@hotmail.com 或 telegram: https://t.me/komari17 提供你的收款钱包地址以及接收区块交易通知的回调服务器地址，如:

    ```
        wallet address: TMKRJzNczpRbyXoFufzHGnMR2Vj76CvNq2
        notice server: https://exmaple.com/notice/transaction
    ```

    我将为你提供接入区块网络节点支持。设置钱包以及通知服务器后，运行例子代码, 访问页面: http://localhost:9200/testpay.html  即可进行支付测试。

    如果你想立即进行测试也可访问测试页面: http://a.aqua.ws/testpay.html 进行支付测试,不过再次页面上你将无法观察广播交易通知。


# samples 2
    Please email: heimao117@gmail.com or kirino17@hotmail.com or telegram: https://t.me/komari17 Provide your receiving wallet address and the callback server address for receiving block transaction notifications, such as:

     ````
         wallet address: TMKRJzNczpRbyXoFufzHGnMR2Vj76CvNq2
         notice server: https://exmaple.com/notice/transaction
     ````

     I will provide you with access to block network node support. After setting up the wallet and notifying the server, run the sample code and visit the page: http://localhost:9200/testpay.html to test the payment.

     If you want to test it immediately, you can also visit the test page: http://a.aqua.ws/testpay.html to test the payment, but again you will not be able to observe the broadcast transaction notification on the page.


# pay page templates

支付模板页面展示：
![](https://s3.bmp.ovh/imgs/2022/06/13/ff478c27130e0d73.png)

