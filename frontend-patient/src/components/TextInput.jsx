
export default function TextInput({label, ...props}){
  return (
    <div className="input">
      <label>{label}</label>
      <input {...props}/>
    </div>
  )
}