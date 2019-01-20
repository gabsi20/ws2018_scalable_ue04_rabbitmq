export default function(message){
  let dashedString = "";
  for(let i = 0; i < message.length; i++){
    dashedString += i == message.length - 1 ? message.charAt(i) : message.charAt(i) + '-';
  }
  return dashedString;
}
