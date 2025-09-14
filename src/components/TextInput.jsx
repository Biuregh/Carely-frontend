const TextInput = ({ label, ...props }) => {
  return (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <input
      {...props}
      className="w-full rounded border border-gray-300 px-3 py-2 
                 focus:outline-none focus:ring-2 focus:ring-teal-500"
    />
  </div>
);
};

export default TextInput;
