const BASE_URL = `${import.meta.env.VITE_BACK_END_SERVER_URL}/appointments`;


const index = async () => {
  try {
    const res = await fetch(BASE_URL, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    return res.json();
  } catch (error) {
    console.log(error);
  }
};

const updateStatus = async (id, status) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });

  if (!res.ok) throw new Error('Failed to update status');
  return res.json();
};

export { 
  index,
  updateStatus
};
