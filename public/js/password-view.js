
let response = await fetch('/records');
let records = await response.json();

let TableBody = document.querySelector('tbody');
function FillTable(data) {
  TableBody.innerHTML = '';

  for(let row of data) {
    let tr = document.createElement('tr');
    tr.innerHTML = `<td class="selection"><input type="checkbox"></td>`;

    let platform = document.createElement('td');
    let username = document.createElement('td');
    let password = document.createElement('td');

    platform.innerText = row.platform;
    username.innerText = row.username;

    let pvalue = document.createElement('input');
    pvalue.className = 'p';
    pvalue.type = 'password';
    pvalue.value = row.password;
    pvalue.readOnly = true;

    password.appendChild(pvalue);

    pvalue.addEventListener('mouseover', () => {
      pvalue.type = 'text';
    });

    pvalue.addEventListener('mouseleave', () => {
        pvalue.type = 'password';
    });

    tr.appendChild(platform);
    tr.appendChild(username);
    tr.appendChild(password);
    
    TableBody.appendChild(tr);
  }
}
FillTable(records);

const SearchBar = document.querySelector('.search-bar');
let FilterGo;
let SerachTypeEvent = SearchBar.addEventListener('input',function() {
  console.log('typping...');

  if(typeof FilterGo !== 'undefined') {
    clearTimeout(FilterGo);
  }

  FilterGo = setTimeout(()=>{
    let filtered = [];
    for(let i=0; i<records.length; ++i) {
      if(records[i].username.includes(SearchBar.value) || records[i].platform.includes(SearchBar.value)) {
        filtered.push(records[i]);
      }
    }
    FillTable(filtered);
    console.log(filtered);
  },500);

  if(SearchBar.value === '') {
    clearTimeout(FilterGo);
    console.log('Default view');
    FillTable(records);
  }
});


document.querySelector('.confirm-delete').addEventListener('click', async function() {
  if (TableBody) {

    let toBeDeleted = [];

    const data = [...TableBody.rows].map((r) => [...r.cells].map((c) => c.innerText));
    let selections = Array.from(document.querySelectorAll(".selection > input"));
    for(let i=0; i<data.length; ++i) {
      data[i][0] = selections[i].checked;
      if(selections[i].checked) {
        toBeDeleted.push({
          platform : data[i][1],
          username : data[i][2]
        });
      }
    }

    if(toBeDeleted.length>0) {
      try {
        let deleteResponse = await (await fetch('/records/remove',{
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          method: 'post',
          body: JSON.stringify(toBeDeleted)
        })).json();
        console.log('deleteResponse : ',deleteResponse);

        if(deleteResponse) window.location.href = '/view';
        
      } catch(err) {
        console.error(err);
      }
    }
  }
});

const AddWall = document.querySelector('.add-wall');
const BtnSet1 = document.querySelector('.btn-set1');
const BtnSet2 = document.querySelector('.btn-set2');

// logout button
document.querySelector('.logout').addEventListener('click', async function(){
  try {
    let logOutSuccess = await (await fetch('/logout', {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: 'post',
      body: JSON.stringify({})
    })).json();

    if(logOutSuccess) window.location.href = '/login';
  } catch(err) {
    console.error(err);
  }
});

document.querySelector('.remove-record').addEventListener('click',function(){

  SearchBar.style.display = 'none';

  BtnSet1.style.display = 'none';
  BtnSet2.style.display = 'block';
  let SelectionColumn = Array.from(document.querySelectorAll('.selection'));
  for(let row of SelectionColumn) {
    row.style.display = 'table-cell';
  }
});

document.querySelector('.cancel-delete').addEventListener('click',function(){

  SearchBar.style.display = 'inline';

  BtnSet1.style.display = 'block';
  BtnSet2.style.display = 'none';

  let SelectionBoxes = Array.from(document.querySelectorAll('.selection > input'));
  for(let row of SelectionBoxes) {
    row.checked = false;
  }

  let SelectionColumn = Array.from(document.querySelectorAll('.selection'));
  for(let row of SelectionColumn) {
    row.style.display = 'none';
  }
});

document.querySelector('.add-record').addEventListener('click', function(){
  AddWall.style.display = 'flex';
});

document.querySelector('.add-cancel').addEventListener('click', function(){
  AddWall.style.display = 'none';
});

const UserMenuDiv = document.querySelector('.user-menu');
document.querySelector('.menu-button').addEventListener('click', ()=> {
  UserMenuDiv.style.display = 'flex';
});

document.querySelector('.user-menu-exit').addEventListener('click', ()=> {
  UserMenuDiv.style.display = 'none';
});