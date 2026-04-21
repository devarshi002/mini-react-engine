function getData() {
    fetch('https://api.example.com/users')
    .then(r=>r.json())
    .then(data=>{
        const list = document.getElementsById('user-list');
        list.innerHTML=''

        for (let i =0; i< data.length; i++) {
            if(data[i].subStatus === 'active' && data[i].points > 500) {
                let li = document.createElement('li')

                li.innerText = data[i].name.toUpperCase() + " (VIP)";
                list.appendChild(li);
            }
        }
    })

    .catch(e=>console.log("error"));
    
}