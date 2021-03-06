const express = require('express');

// import in the Product model
const {Product, Brand} = require('../models')
const {bootstrapField, createProductForm} = require('../forms')

// create the new router
const router = express.Router();

async function getProductById(productId){
    // eqv of
    // select * from products where id = ${productId}
    const product = await Product.where({
        'id': productId
    }).fetch({
        'require': true // will cause an error if not found
    })
    return product;

}

router.get('/', async (req,res)=>{
    // fetch all the products
    // The NAME of the MODEL always refer
    // to the entire table
    let products = await Product.collection().fetch();
    res.render('products/index',{
        'products':products.toJSON() // convert the results to JSON
    })
})

router.get('/create', async (req,res)=>{
    const form = createProductForm();
    res.render('products/create',{
        'form':  form.toHTML(bootstrapField)
    })
})

router.post('/create', async(req,res)=>{
    const form = createProductForm();
    form.handle(req, {
        'success': async(form)=>{

            // create an instance of the Product model
            // if we refering to the MODEL directly, we are accessing the entire table
           // if we referring to the instance of the model, then we are accessing one row
           // eqv:
           /*
            insert into products (name, cost, description)
             values (?, ?, ?)
           */
            const product = new Product();
            product.set('name', form.data.name);
            product.set('cost', form.data.cost);
            product.set('description', form.data.description);
            await product.save();
            res.redirect('/products');
        },
        'error': async(form)=>{
            res.render('products/create',{
                'form': form.toHTML(bootstrapField)
            })
        }
    })
})

router.get('/:id/update', async(req,res)=>{

    const product = await getProductById(req.params.id);

    // create the product form
    const form = createProductForm();

    // fill in the values of each input in the form
    form.fields.name.value = product.get('name');
    form.fields.cost.value = product.get('cost');
    form.fields.description.value = product.get('description');

    res.render('products/update', {
        'form': form.toHTML(bootstrapField),
        'product': product.toJSON()
    })
})

router.post('/:id/update', async (req,res)=>{
    // 1. fetch the product that we want to update
    const product = await getProductById(req.params.id);
    

    // 2. handle the form
    const form = createProductForm();
    form.handle(req, {
        'success': async (form) => {
            product.set(form.data);
            product.save();
            res.redirect('/products');
        },
        'error': async(form) => {
            res.render('products/update',{
                'form': form.toHTML(bootstrapField)
            })
        }
    })
})

router.get('/:id/delete', async(req,res)=>{
    const product = await getProductById(req.params.id);
    res.render('products/delete',{
        product: product.toJSON()
    })
})

router.post('/:id/delete', async(req,res)=>{
    const product = await getProductById(req.params.id);
    await product.destroy();
    res.redirect('/products');
})

router.get('/brands', async (req,res)=>{
    let brands = await Brand.collection().fetch();
    res.render('products/brands', {
        'brands': brands.toJSON()
    })
})

module.exports = router;