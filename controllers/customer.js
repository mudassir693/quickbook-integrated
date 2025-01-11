import tokenDb from '../tokenDB.js'
import qboFn from '../config/Auth.js'

export const getCustomerInvoices = async (req, res) => {
    try {
        if (!qbo) {
            return res.status(400).json({ data: "QuickBooks instance is not initialized", error: true });
        }

        const invoiceResponse = await qbo.getInvoice(152);
        return res.status(200).json({ data: invoiceResponse, error: false });
    } catch (error) {
        return res.status(500).json({ data: error, error: true });
    }
}

export const createCustomer = (req, res) => {
    try {
        const customer = {
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

        qbo.createCustomer(customer, (err, response) => {
            if (err) {
                return res.status(400).json({ data: err, error: true });
            }
            return res.status(201).json({ data: response, error: false });
        });
    } catch (error) {
        return res.status(500).json({ data: error, error: true });
    }
}

export const getAllCustomers = async (req, res) => {
    try {
        let qbo = qboFn(tokenDb);
        if (tokenDb.length === 0) return res.status(400).json({ data: "QuickBooks instance not initialized", error: true });

        qbo.findCustomers({ fetchAll: true }, (err, response) => {
            if (err) {
                return res.status(400).json({ data: err, error: true });
            }
            return res.status(200).json({ data: response, error: false });
        });
    } catch (error) {
        return res.status(500).json({ data: error, error: true });
    }
}

export const createInvoice = async (req, res) => {
    try {
        const { customerId } = req.body;
        if (!customerId) {
            return res.status(400).json({ data: 'Customer ID is required', error: true });
        }

        const invoice = {
            "Line": [
                {
                    "Amount": 40.00,
                    "DetailType": "SalesItemLineDetail",
                    "SalesItemLineDetail": {
                        "ItemRef": {
                            "value": "6",
                            "name": "Consultancy"
                        },
                        "Qty": 7
                    }
                }
            ],
            "CustomerRef": {
                "value": customerId
            },
            "DueDate": "2023-02-04"
        };

        qbo.getCustomer(customerId, (error, customer) => {
            if (error) {
                return res.status(400).json({ data: 'Customer not found', error: true });
            }

            qbo.createInvoice(invoice, (error, invoiceResponse) => {
                if (error) {
                    return res.status(400).json({ data: 'Error creating invoice', error: true });
                }
                return res.status(200).json({ data: invoiceResponse, error: false });
            });
        });
    } catch (error) {
        return res.status(500).json({ data: error, error: true });
    }
}

export const getAllCustomerInvoices = async (req, res) => {
    try {
        let qbo = qboFn(tokenDb);
        if (tokenDb.length === 0) return res.status(400).json({ data: "QuickBooks instance not initialized", error: true });

        qbo.findInvoices([{ CustomerRef: req.params.cId }], (err, response) => {
            if (err) {
                return res.status(400).json({ data: err, error: true });
            }

            const sortedInvoices = response.QueryResponse.Invoice.sort((a, b) => new Date(a.TxnDate) - new Date(b.TxnDate));
            return res.status(200).json({ data: sortedInvoices, error: false });
        });
    } catch (error) {
        return res.status(500).json({ data: error, error: true });
    }
}

export const getAllPayments = async (req, res) => {
    try {
        let qbo = qboFn(tokenDb);
        if (tokenDb.length === 0) return res.status(400).json({ data: "QuickBooks instance not initialized", error: true });

        qbo.findPayments({ CustomerRef: req.params.pId }, (err, response) => {
            if (err) {
                return res.status(400).json({ data: err, error: true });
            }

            const sortedPayments = response.QueryResponse.Payment.sort((a, b) => new Date(a.TxnDate) - new Date(b.TxnDate));
            return res.status(200).json({ data: sortedPayments, error: false });
        });
    } catch (error) {
        return res.status(500).json({ data: error, error: true });
    }
}

export const getAllCustomerRecord = async (req, res) => {
    try {
        let qbo = qboFn(tokenDb);
        if (tokenDb.length === 0) return res.status(400).json({ data: "QuickBooks instance not initialized", error: true });

        qbo.findPayments({ CustomerRef: req.params.pId }, (err, payments) => {
            if (err) {
                return res.status(400).json({ data: err, error: true });
            }

            qbo.findInvoices([{ CustomerRef: req.params.pId }], (err, invoices) => {
                if (err) {
                    return res.status(400).json({ data: err, error: true });
                }

                const combinedRecords = payments.QueryResponse.Payment.concat(invoices.QueryResponse.Invoice);
                const sortedRecords = combinedRecords.sort((a, b) => new Date(a.TxnDate) - new Date(b.TxnDate));

                return res.status(200).json({ data: sortedRecords, error: false });
            });
        });
    } catch (error) {
        return res.status(500).json({ data: error, error: true });
    }
}
