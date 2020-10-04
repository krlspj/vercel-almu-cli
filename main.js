const stringToHTML = (s) => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(s, 'text/html')
    return doc.body.firstChild
}

const renderItem = (item) => {
    const element = stringToHTML(`<li data-id="${item._id}">${item.name}</li>`)
    console.log(element)
    return element
}

window.onload = () => {
fetch('https://serverless-vercel.krlspj.vercel.app/api/meals')
    .then(res => res.json())
    .then(data => {
        const mealsList = document.getElementById('meals-list')
        const submit = document.getElementById('submit')
        const listItems = data.map(renderItem)
        listItems.forEach(elem => mealsList.appendChild(elem))
        submit.removeAttribute('disabled')
    })
}