
import tokenDb from '../tokenDB.js'
import qboFn from '../config/Auth.js'

export const getCustomerInvoices = async(req,res)=>{
    try{

        let invoiceObj = {
            Line: [
              {
                Amount: 10.00,
                DetailType: "SalesItemLineDetail",
                SalesItemLineDetail: {
                  ItemRef: {
                    value: "6",
                    name: "Consultancy"
                  },
                  Qty:1
                }
              }
            ],
            CustomerRef: {
              value: "58"
            },
            DueDate:"2023-02-04"
          }

          if(!qbo){
            return res.status(400).json({data:"quickbook instance is not inistialize",error:true})
          }

          let resp = await qbo.getInvoice(152,(err,resp)=>{
            // console.log('err',err)
            // console.log(resp)
            return res.status(200).json({data:resp,error:false})
          })
        //   return res.status(200).json({data:resp,error:false})
    }catch(e){
        // console.log(e)
        return res.status(500).json({data:e,error:true})
    }
}

export const createCustomer = (req,res)=>{
    try {
        let customer = {
            "BillAddr": {
                "Line1": "Teachers society",
                "City": "Karachi",
                "Country": "Pakistan",
                "CountrySubDivisionCode": "PK",
                "PostalCode": "35000"
            },
            "Notes": "Here are other details.",
            "DisplayName": "Node.JS",
            "PrimaryPhone": {
                "FreeFormNumber": "0332 0018802"
            },
            "PrimaryEmailAddr": {
                "Address": "mudassirsiddiqui277@gmail.com"
            }
        }
        const resp = qbo.createCustomer(customer,(err,resp)=>{
            if(err){
                return res.status(400).json({data:err,error:true})
            }
            return res.status(201).json({data:resp,error:false})
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({data:error, error:true})
    }
}

export const getAllCustomers = async (req,res)=>{
    try{
        // if(!qbo){
        //     return res.status(400).json({data:"qbo instance in not initialize"})
        // }
        let qbo = qboFn(tokenDb)
        console.log(tokenDb)
        if(tokenDb.length==0)return res.status(400).json({data:"qbo instance not initialized",error:true})
        qbo.findCustomers(
            {fetchAll:true}
            ,(err,resp)=>{
                if(err){
                    return res.status(400).json({data:err,error:true})
                }
                console.log('token which I am looking',tokenDb)
                return res.status(200).json({data:resp,error:false})
            })
    }catch(err){
        // console.log(err)
        return res.status(500).json({data:err, error:true})
    }
}

export const createInvoice = async(req,res)=>{
    try {
        let {customerId} = req.body

        if(!customerId){
            return res.status(400).json({data:'customer id is required feild', error:true})
        }
        
        let invoice = {
            "Line": [
              {
                "Amount": 40.00,
                "DetailType": "SalesItemLineDetail",
                "SalesItemLineDetail": {
                  "ItemRef": {
                    "value": "6",
                    "name": "Consultancy"
                  },
                  "Qty":7
                }
              }
            ],
            "CustomerRef": {
              "value": customerId
            },
            "DueDate":"2023-02-04"
          }

          qbo.getCustomer(customerId,(error,resp)=>{
            if(error){
                return res.status(400).json({data:'customer not found',error:true})
            }

            qbo.createInvoice(invoice,(error,resp)=>{
                if(error){
                    return res.status(400).json({data:'create Invoice error',error:true})
                }
                return res.status(200).json({data:resp,error:false})
            })

            // console.log('what: ',resp)
            // return res.status(200).json({data:resp,error:false})
        })
    } catch (error) {
        console.log(err)
        return res.status(500).json({data:err, error:true})
    }
}

export const getAllCustomerInvoices = async (req,res)=>{
    
    try {
        let qbo = qboFn(tokenDb)
        console.log(tokenDb)
        if(tokenDb.length==0)return res.status(400).json({data:"qbo instance not initialized",error:true})

        qbo.findInvoices([{CustomerRef:req.params.cId}],(err,resp)=>{
            if(err){
                return res.status(400).json({data:err, error:true})
            }
            // console.log(resp.QueryResponse.Invoice.length)
            let newArr = resp.QueryResponse.Invoice.sort((a,b)=>new Date(a.TxnDate).getTime() - new Date(b.TxnDate).getTime())
            return res.status(200).json({data:newArr, error:false})
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({data:error, error:true})
    }
}

export const getAllPayments = async(req,res)=>{
    try {
        let qbo = qboFn(tokenDb)
        console.log(tokenDb)
        if(tokenDb.length==0)return res.status(400).json({data:"qbo instance not initialized",error:true})

         qbo.findPayments({CustomerRef:req.params.pId},(err,resp)=>{
            if(err){
                return res.status(400).json({data:err, error:true})
            }
            console.log(resp.QueryResponse.Payment.length)
            let newArr = resp.QueryResponse.Payment.sort((a,b)=>new Date(a.TxnDate).getTime() - new Date(b.TxnDate).getTime())
            return res.status(200).json({data:newArr, error:false})
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({data:error, error:true})
    }
}

export const getAllCustomerRecord = async(req,res)=>{
    try {
        let qbo = qboFn(tokenDb)
        console.log(tokenDb)
        if(tokenDb.length==0)return res.status(400).json({data:"qbo instance not initialized",error:true})
        qbo.findPayments({CustomerRef:req.params.pId},(err,payments)=>{
            if(err){
                return res.status(400).json({data:err, error:true})
            }
            qbo.findInvoices([{CustomerRef:req.params.pId}],(err,invoices)=>{
                if(err){
                    return res.status(400).json({data:err, error:true})
                }
                // let Arr = payments.QueryResponse.Payment

                let Arr2 = payments.QueryResponse.Payment.concat(invoices.QueryResponse.Invoice)

                console.log(Arr2.length)
                let newArr = Arr2.sort((a,b)=>new Date(a.TxnDate).getTime() - new Date(b.TxnDate).getTime())
                return res.status(200).json({data:newArr, error:false})
            })
            // console.log(payments.QueryResponse.Payment.length)
            // let newArr = payments.QueryResponse.Payment.sort((a,b)=>new Date(a.TxnDate).getTime() - new Date(b.TxnDate).getTime())
            // return res.status(200).json({data:newArr, error:false})
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({data:error, error:true})
    }
}