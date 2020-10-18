'use strict'
let user = {}
let ruta = 'login' // login, register, orders
let mealsState = []

const stringToHTML = (s) => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(s, 'text/html')
    return doc.body.firstChild
}

const renderItem = (item) => {
    const element = stringToHTML(`<li data-id="${item._id}">${item.name}</li>`)
    element.addEventListener('click', () => {
        const mealsList = document.getElementById('meals-list')
        Array.from(mealsList.children).forEach(el => el.classList.remove('selected'))
        element.classList.add('selected')
        const mealsInput = document.getElementById('meals-id')
        mealsInput.value = item._id
    })
    return element
}

const renderOrder = (order, meals) => {
    const meal = meals.find(meal => meal._id === order.meal_id)
    const element = stringToHTML(`<li data-id="${order._id}">${meal.name}\
     - ${order.user_id}\
     - ${order.user_name}\
     - ${order.oTime}</li>`)
    return element
}

const getTime = () => {
    const d = new Date()
    return `${d.toLocaleDateString()} - ${d.toLocaleTimeString()}`
}

const inicializaFormulario = () => {
    const orderForm = document.getElementById('order')
    orderForm.onsubmit = (e) => {
        e.preventDefault()
        const submit = document.getElementById('submit')
        const mealId = document.getElementById('meals-id')
        const mealIdValue = mealId.value
        if(!mealIdValue) {
            alert('Debe seleccionar un plato')
            return
        }
        submit.setAttribute('disabled', true)

        const order = {
            meal_id: mealIdValue,
            user_id: user._id,
            user_name: user.email,
            oTime: getTime()
        }

        const token = localStorage.getItem('token')
        //fetch('http://localhost:3000/api/orders', {
        fetch('https://serverless-vercel.krlspj.vercel.app/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                authorization: token
            },
            body: JSON.stringify(order)
        }).then(x => x.json())
          .then(res => {
              //console.log('res', res)
              const renderedOrder = renderOrder(res,mealsState)
              const ordersList = document.getElementById('orders')
              ordersList.appendChild(renderedOrder)
              submit.removeAttribute('disabled', true)
          })
    }
}

const inicializaDatos = () => {
    //fetch('http://localhost:3000/api/meals')
    fetch('https://serverless-vercel.krlspj.vercel.app/api/meals')
        .then(res => res.json())
        .then(data => {
            mealsState = data
            const mealsList = document.getElementById('meals-list')
            mealsList.innerHTML = ''
            const submit = document.getElementById('submit')
            const listItems = data.map(renderItem)
            listItems.forEach(elem => mealsList.appendChild(elem))
            submit.removeAttribute('disabled')
            
            //fetch('http://localhost:3000/api/orders')
            fetch('https://serverless-vercel.krlspj.vercel.app/api/orders')
                .then(res => res.json())
                .then(ordersData => {
                    const ordersList = document.getElementById('orders')
                    const listOrders = ordersData.map(order => renderOrder(order, data))
                    ordersList.innerHTML = ''
                    listOrders.forEach(order => ordersList.appendChild(order))
                    //console.log('orders -> ', ordersData)
                })
    })
}

const renderApp = () => {
    const token = localStorage.getItem('token')
    if (token) {
        user = JSON.parse(localStorage.getItem('user'))
        return renderOrders()
    }
    renderLogin()
    //console.log('token', token)
}

const renderOrders = () => {
    const ordersView = document.getElementById('orders-view')
    //console.log('ordersView', ordersView)
    document.getElementById('app').innerHTML = ordersView.innerHTML
    inicializaFormulario()
    inicializaDatos()
}

const renderLogin = () => {
    const loginView = document.getElementById('login-view')
    document.getElementById('app').innerHTML = loginView.innerHTML
    const loginForm = document.getElementById('login-form')
    
    loginForm.onsubmit = (e) => {
        e.preventDefault()
        const email = document.getElementById('email').value
        const password = document.getElementById('password').value
        //fetch('http://localhost:3000/api/auth/login', {
        fetch('https://serverless-vercel.krlspj.vercel.app/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({email, password}) // =>body: JSON.stringify({email: email, password: password})
        }).then(x => x.json())
        .then(resp => {
            localStorage.setItem('token', resp.token)
            ruta = 'orders'
            return resp.token
        }).then(token => {
            //return fetch('http://localhost:3000/api/auth/me', {
            return fetch('https://serverless-vercel.krlspj.vercel.app/api/auth/me', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    authorization: token
                }
            })
        }).then(x => x.json())
            .then(fetchedUser => {
                localStorage.setItem('user', JSON.stringify(fetchedUser))
                user = fetchedUser
            })
        .then(() => renderOrders())
    }
}

window.onload = () => {
    renderApp()
    
}