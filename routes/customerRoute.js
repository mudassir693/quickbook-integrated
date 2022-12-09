import express from 'express'
import { getCustomerInvoices,createCustomer, getAllCustomers, createInvoice, getAllCustomerInvoices, getAllPayments } from '../controllers/customer.js'

const router = express.Router()

router
    .post('/getAllInvoices', getCustomerInvoices)
    .get('/createCustomer', createCustomer)
    .get('/getAllCustomers',getAllCustomers)
    .post('/createInvoice',createInvoice)
    .get('/customerAllInvoices/:cId', getAllCustomerInvoices)
    .get('/customerAllInvoices/:pId', getAllPayments)

export default router