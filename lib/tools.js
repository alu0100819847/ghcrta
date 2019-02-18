'use babel';

export function autobind(self, ...methods) {
  for (const method of methods) {
    if (typeof self[method] !== 'function') {
      throw new Error(`Unable to autobind method ${method}`);
    }
    self[method] = self[method].bind(self);
  }
}

export async function asyncClasses(asyncClass){
  return new Promise((resolve, reject) => {
    resolve(asyncClass)
  })
}

export function deleteInput(event, input){
  let text = input.value
  if(event.keyCode == 8){
    input.value = text.substring(0, text.length-1)

  }
}

export function divideList(list, pag_size, add = []){
  let divided_list = add
  let size = list.length
  for(var i = 0; i < size; i+=pag_size){
    divided_list.push(list.splice(0, pag_size))
  }
  return divided_list
}
