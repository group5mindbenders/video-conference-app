const sock = io();
var objects=[];

function NotesRender() {
    console.log('hey');
        if(document.querySelector('.W')){
            console.log('images tag being removed')
            document.querySelector('.W').parentNode.removeChild(document.querySelector('.W'));
        
        }
        while(document.querySelector('.Notes')){
            document.querySelector('.Notes').parentNode.removeChild(document.querySelector('.Notes'));
            
        }
        const div1 = document.createElement('div'); 
        div1.innerHTML=`Notes`;
        div1.classList.add('W'); 
        document.querySelector('.box').appendChild(div1); 
    console.log($('.Notes').length)
    sock.emit('note','pls send');
    console.log('requests sent!');
    
}
sock.on('dataUrl',notes=>{
    console.log(notes);
            
    objects=notes;
        
    uniqueId(objects).forEach(element => {
        const div = document.createElement('div'); 
        div.classList.add('Notes'); 
        div.onclick = function(){sock.emit('images needed',element);}
        div.innerHTML=`${element}`;
        document.querySelector('.box').appendChild(div);
            
    });
});


sock.on('downloadIt',msg=>{
    window.open('/downloads');
});

function uniqueId(duplicates){
    var arr=[]
    duplicates.forEach(element => {
        arr.push(element.Question);
    });
    let unique = [...new Set(arr)];
    console.log(unique);
    return unique
    
}
function logout(){
    window.location.href="/user/logout";
    //window.close();
}