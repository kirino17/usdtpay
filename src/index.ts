import express from 'express'
import axios from 'axios'

/**
 * 面向服务端接受交易通知接口
 */
namespace reverseSide {
    // 支付网关地址
    const paymentGatewayUrl: string = 'http://localhost:9110';

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

    /**
     * 余额查询
     */
    interface BalanceBody {
        // 余额值
        balance: string;

        //余额精度
        decimal: number;
    }

    // 创建支付订单body
    interface createPayBody {
        //支付金额
        amount: number;

        //自定义订单id(需唯一)
        orderid: string;

        //订单自定义参数
        params: {
            //商品名称
            name: string;

            //商品描述
            desc: string;

            //商品图片
            snapshot: string;

            //其它参数
            other?: any;
        }
    }

    // 返回订单信息body
    interface createPayResultBody {
        //实际支付金额
        amount: number;

        //小数精度
        declmal: number;

        //订单过期时间(秒)
        expire: number;

        //订单id
        orderid: string;

        //订单支付页面地址
        frontend: string;

        //交易id
        id: number;
    }

    function dateFormat(fmt:string, date:Date) {
        let ret;
        const opt = {
            "Y+": date.getFullYear().toString(),        // 年
            "m+": (date.getMonth() + 1).toString(),     // 月
            "d+": date.getDate().toString(),            // 日
            "H+": date.getHours().toString(),           // 时
            "M+": date.getMinutes().toString(),         // 分
            "S+": date.getSeconds().toString()          // 秒
            // 有其他格式化字符需求可以继续添加，必须转化成字符串
        };
        for (let k in opt) {
            ret = new RegExp("(" + k + ")").exec(fmt);
            if (ret) {
                fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
            };
        };
        return fmt;
    }

    /**
     * 测试服务器
     */
    export async function createTestServer() {
        let app = express();
        const port = 9200;

        let orderNum:number = 1;
        let todayNum:number = parseInt(dateFormat('YYYYmmdd',new Date()));

        app.use(express.json());
        app.use('/',express.static('public'));

        //接收交易通知
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

        //接收订单创建
        app.post('/createOrder',async (req, res) => {
            try {
                let pay = req.body;
                console.log("收到新的订单创建请求: ", pay);
                orderNum++;
                let result = await requestPay(pay.name,
                    pay.desc,
                    pay.amount,`${todayNum}${orderNum}`,
                    pay.snapshot);
                res.send({status: true, data: result});
                return;
            }
            catch(e){
                console.log('/pay error: ', e);
            }
            res.send({status: true});
        });

        //转发余额查询
        app.get('/balance',async (req, res) => {
            try {
                let balance = await balanceOf();
                console.log("收到余额查询请求: ", balance);
                res.send({status: true, data: balance});
            }
            catch(e){
                console.log('/balance error: ', e);
                res.send({status: false});
            }
        });

        //转发支付页面
        app.get('/pay',async (req, res) => {
            try {
                let result = await updatePay(req.query.order as string);
                res.setHeader('Content-Type', 'text/html');
                res.send(result);
            }
            catch(e){
                console.log('/pay error: ', e);
                res.send('');
            }
        });

        //转发支付结果
        app.get('/check',async (req, res) => {
            try {
                let result = await checkPay(req.query.order as string);
                res.send({status: result});
            }
            catch(e){
                console.log('/check error: ', e);
                res.send({status: true});
            }
        });

        app.listen(port, () => {
            console.log(`Example app listening on port ${port}`);
        });
    }

    /**
     * 获取钱包当前余额
     * @returns 
     */
    async function balanceOf(){
        try {
            let resp = await axios.get(`${paymentGatewayUrl}/balance`);
            let object:BalanceBody = resp.data as BalanceBody;
            console.log(object);
            return parseInt(object.balance) / Math.pow(10,object.decimal);
        }
        catch(e){
            console.log('balanceOf error: ', e);
        }
        return 0;
    }

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
            console.log(`${paymentGatewayUrl}/order`);
            let resp = await axios.post(`${paymentGatewayUrl}/order`, body);
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

    /**
     * 获取订单支付页面
     * @param orderid 订单id
     */
    async function updatePay(orderid: string): Promise<string>{
        try {
            let resp = await axios.get(`${paymentGatewayUrl}/pay?order=${orderid}`);
            return resp.data;
        }
        catch(e){
            console.log('checkPay error: ', e);
        }
        //发生异常的时候返回true, 返回false时前端支付页面会自动关闭
        return '';
    }
}


//测试服务器
reverseSide.createTestServer();