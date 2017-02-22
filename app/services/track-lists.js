import Ember from 'ember';

const {
  Service
} = Ember;

export default Service.extend({

  popTracks: [
    { trackUrl: 'https://soundcloud.com/supersofar/thursday', trackInfo: "Supersofar - Thursday", isDefault: true },
    { trackUrl: 'https://soundcloud.com/howardjonesmusic/2-things-can-only-get-better', trackInfo: "Howard Jones - Things Can Only Get Better", isDefault: false },
    { trackUrl: 'https://soundcloud.com/janskie-deeds/easy-tonight-5-for-fighting', trackInfo: "Janskie Deeds - Easy Tonight", isDefault: false }
  ],

  rockTracks: [
    { trackUrl: 'https://soundcloud.com/juan_mj_10/led-zeppelin-rock-n-roll', trackInfo: "Led Zeppelin - Rock N Roll", isDefault: true },
    { trackUrl: 'https://soundcloud.com/rageagainstthemachineofficial/killing-in-the-name-demo', trackInfo: "Rage Against the Machine - Killing (Demo)", isDefault: false },
    { trackUrl: 'https://soundcloud.com/demonofrock/kid-rock-american-bad-ass', trackInfo: "Kid Rock - American Bad Ass", isDefault: false }
  ],

  tranceTracks: [
    { trackUrl: 'https://soundcloud.com/valentinojorno/valentino-jorno-mortal-kombat-dance', trackInfo: "Valentino Jorno - MKD", isDefault: false },
    { trackUrl: 'https://soundcloud.com/themachineryinside/oceanbreathe-suffocating', trackInfo: "The Machinery Inside - Ocean Breathe (Remix)", isDefault: true },
    { trackUrl: 'https://soundcloud.com/djhang/techno-2', trackInfo: "DJ Hang - Techno 2", isDefault: false }
  ]

});
