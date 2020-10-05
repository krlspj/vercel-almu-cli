'use strict'

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
     - ${order.user_id}</li>`)
    return element
}

window.onload = () => {
    const orderForm = document.getElementById('order')
    orderForm.onsubmit = (e) => {
        e.preventDefault()
        const mealId = document.getElementById('meals-id')
        const mealIdValue = mealId.value
        if(!mealIdValue) {
            alert('Debe seleccionar un plato')
            return
        }

        const order = {
            meal_id: mealIdValue,
            user_id: 'chanchito feliz'
        }
        fetch('https://serverless-vercel.krlspj.vercel.app/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(order)
        }).then(x => x.json())
          .then(res => {
              const renderedOrder = renderOrder(res,mealsState)
              const ordersList = document.getElementById('orders')
              ordersList.appendChild(renderedOrder)
          })

    }

    

    
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
            fetch('https://serverless-vercel.krlspj.vercel.app/api/orders')
                .then(res => res.json())
                .then(ordersData => {
                    const ordersList = document.getElementById('orders')
                    const listOrders = ordersData.map(order => renderOrder(order, data))
                    ordersList.innerHTML = ''
                    listOrders.forEach(order => ordersList.appendChild(order))
                    console.log('orders -> ', ordersData)
                })
    })
}