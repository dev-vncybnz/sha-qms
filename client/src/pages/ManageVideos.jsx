import React, { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import Swal from 'sweetalert2';
import { useAuth } from '../contexts/AuthContext';

const ManageVideos = () => {

  const [videoId, setVideoId] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [error, setError] = useState(null);
  const authContext = useAuth();

  useEffect(() => {
    if (error) {
      Swal.fire({
        title: 'Upload Error!',
        text: error,
        icon: 'error',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        allowOutsideClick: false,
        allowEscapeKey: false
      })
        .then(() => setError(null));
    }
  }, [error]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchVideo = async () => {
      const token = authContext.token;

      const baseUrl = import.meta.env.VITE_API_URL;
      const apiKey = import.meta.env.VITE_API_KEY;
      const url = `${baseUrl}/api/videos`;
      const requestOptions = {
        signal: controller.signal,
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-API-KEY': apiKey,
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await fetch(url, requestOptions);
      const responseJSON = await response.json();
      const { filename } = responseJSON;
      const videoUrl = `${baseUrl}/storage/videos/${filename}`;

      console.log(responseJSON, videoUrl);
      setVideoUrl(videoUrl);
    };

    fetchVideo();

    return () => {
      controller.abort();
    }
  }, [videoId]);

  const onClickReplace = () => {
    const videoUploaderInput = document.querySelector("#video-uploader");
    videoUploaderInput.click();
  }

  const onChangeTrigger = async (e) => {
    const file = e.target.files[0];

    if (file && file.type !== "video/mp4") {
      setError("Please select only mp4 video");
      e.target.value = "";

      return;
    }

    const token = authContext.token;
    const baseUrl = import.meta.env.VITE_API_URL;
    const apiKey = import.meta.env.VITE_API_KEY;
    const url = `${baseUrl}/api/videos`;

    const formData = new FormData();
    formData.append('video', file);

    const requestOptions = {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'X-API-KEY': apiKey,
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    };

    const response = await fetch(url, requestOptions);
    const responseJSON = await response.json();
    const { id } = responseJSON;

    setVideoId(id);
  }

  return (
    <>
      <div className="flex h-screen">
        <Sidebar className="w-1/5" />

        {/* Content */}
        <div className="w-full px-5 py-3 flex flex-col gap-5 items-center self-center">
          <input type="file" id="video-uploader" accept="video/mp4" className="hidden" onChange={onChangeTrigger} />
          <video src={videoUrl} className="border border-black w-4/6" autoPlay muted loop>
            <source src={videoUrl} type="video/mp4" />
          </video>
          <button onClick={onClickReplace} className="bg-red-500 hover:bg-red-400 p-2 self-center text-white rounded-md">Replace Video</button>
        </div>
      </div>
    </>
  )
}

export default ManageVideos