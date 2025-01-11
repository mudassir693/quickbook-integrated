import express from 'express';
import { 
    getCustomerInvoices, 
    createCustomer, 
    getAllCustomers, 
    createInvoice, 
    getAllCustomerInvoices, 
    getAllPayments, 
    getAllCustomerRecord 
} from '../controllers/customer.js';

const router = express.Router();

router
    .post('/invoices', getCustomerInvoices)
    .get('/customer', createCustomer)
    .get('/customers', getAllCustomers)
    .post('/invoice', createInvoice)
    .get('/customer/invoices/:customerId', getAllCustomerInvoices)
    .get('/customer/payments/:paymentId', getAllPayments)
    .get('/customer/records/:customerId', getAllCustomerRecord);

export default router;
