let client = AgoraRTC.createClient({mode:'rtc', 'codec':"vp8"});

let config = {
    appid:'bb6532020d4e4f04affc4fdf484ccc24',
    token:'007eJxTYBB6m295+J/E0Xf3vyds2Po7w3+visVBxTVWZrJLEm/nPypWYEhKMjM1NjIwMkgxSTVJMzBJTEtLNklLSTOxMElOTjYyubWyKaUhkJFBNraQhZEBAkF8PoaczLLU4pKi1MTc+MSCAgYGAG1GJcc=',
    uid:null,
    channel:'livestream_app'
}

let localTracks ={
    audioTrack:null,
    videoTrack:null,
}

let localTrackState = {
    audioTrackMuted:false,
    vedioTrackMuted:false,
}

let remoteTracks={}


document.getElementById('join-btn').addEventListener('click', async ()=>{
    console.log("user Joined stream");

    await joinStreams()
})


document.getElementById('mic-btn').addEventListener('click', async ()=>{
    if(!localTrackState.audioTrackMuted){
        await localTracks.audioTrack.setMuted(true)
        localTrackState.audioTrackMuted = true
    }else{
        await localTracks.audioTrack.setMuted(false)
        localTrackState.audioTrackMuted = false
    }
})


document.getElementById('camera-btn').addEventListener('click', async ()=>{
    if(!localTrackState.vedioTrackMuted){
        await localTracks.videoTrack.setMuted(true)
        localTrackState.vedioTrackMuted = true
    }else{
        await localTracks.videoTrack.setMuted(false)
        localTrackState.vedioTrackMuted = false
    }
})

document.getElementById('leave-btn').addEventListener('click', async ()=>{
    for(trackName in localTracks){
        let track = localTracks[trackName]
        if(track){
            //stop camera and mic
            track.stop()
            //Disconnects from the camera and mic
            track.close()
            localTracks[trackName] = null
        }
    }


    await client.leave()

    document.getElementById('user-streams').innerHTML = ''
})




let joinStreams = async() =>{

    client.on("user-published", handleUserJoined);
    client.on("user-left", handelUserLeft);

    [config.uid, localTracks.audioTrack, localTracks.videoTrack] = await Promise.all([
        client.join(config.appid, config.channel, config.token || null, config.uid || null),
        AgoraRTC.createMicrophoneAudioTrack(),
        AgoraRTC.createCameraVideoTrack()
    ])

    let player = `<div class="video-containers" id="video-wrapper-${config.uid}">
                            <p class="user-uid">${config.uid}</p>
                            <div class="video-player player" id="stream-${config.uid}"></div>
                        </div>`

    document.getElementById('user-streams').insertAdjacentHTML('beforeend', player);
    localTracks.videoTrack.play(`stream-${config.uid}`)

    await client.publish([localTracks.audioTrack, localTracks.videoTrack])
}

let handelUserLeft = async()=>{
    delete remoteTracks[user.uid]
    document.getElementsById(`video-wrapper-${user.uid}`)
}



let handleUserJoined = async (user, mediaType) =>{
    console.log('user has joined our stream')
    remoteTracks[user.uid] = user

    await client.subscribe(user, mediaType)

    let vedioPlayer =  document.getElementById(`video-wrapper-${user.id}`)
    if(vedioPlayer != null){
        vedioPlayer.remove()
    }

    if(mediaType === 'video'){
        let vedioPlayer = `<div class="video-containers" id="video-wrapper-${user.uid}">
                            <p class="user-uid">${user.uid}</p>
                            <div class="video-player player" id="stream-${user.uid}"></div>
                        </div>`
        document.getElementById('user-streams').insertAdjacentHTML('beforeend', vedioPlayer)
        user.videoTrack.play(`stream-${user.uid}`)
    }

    if(mediaType === 'audio'){
        user.audioTrack.play()
    }

}