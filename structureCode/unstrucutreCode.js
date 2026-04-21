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



//make it structured 

const USER_API_URL = 'https://api.example.com/users'

export const fetchUsers = async () => {
    try {
        const res = await fetch(USER_API_URL);
        if(!res.ok) throw new Error('Network response was not ok')
        return await res.json()
    } catch (error) {
        console.error("User Fetch Error:", error)
        return []
    }
}