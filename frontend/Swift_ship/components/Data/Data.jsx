import ecole from  "../../assets/images/ecole.jpg";
import R from "../../assets/images/R.jpg";
import freepik from "../../assets/images/freepik.png";

import Apple from "../../assets/images/Apple.svg";
import Google from "../../assets/images/Google.svg";
import Facebook from "../../assets/images/Facebook.svg";

import Action1 from "../../assets/images/action_icon1.svg";
import Action2 from "../../assets/images/action_icon2.svg";
import Action3 from "../../assets/images/action_icon3.svg";
import Action4 from "../../assets/images/action_icon4.svg";

import Transaction from "../../assets/images/transaction.svg";
import Notify1 from "../../assets/images/notify1.svg";
import Notify2 from "../../assets/images/notify2.svg";
import Notify3 from "../../assets/images/notify3.svg";
import Notify4 from "../../assets/images/notify4.svg";

import Method2 from '../../assets/images/method_icon2.svg';
import Method3 from '../../assets/images/method_icon3.svg';
import Method4 from '../../assets/images/method_icon4.svg';

import Call1 from "../../assets/images/call1.png";
import Call2 from "../../assets/images/call2.png";
import Call3 from "../../assets/images/call3.png";
import Call4 from "../../assets/images/call4.png";
import Call5 from "../../assets/images/call5.png";
import Chat1 from "../../assets/images/Chat1.svg";
import Chat2 from "../../assets/images/Chat2.svg";
import Chat3 from "../../assets/images/Chat3.svg";
import Chat4 from "../../assets/images/Chat4.svg";
import Chat5 from "../../assets/images/Chat5.svg";

import Vector from "../../assets/images/vector.svg";
import Mic2 from "../../assets/images/mic.svg";
import Volume from "../../assets/images/audio.svg";

import Profile_icon1 from "../../assets/images/profile_image1.svg";
import Profile_icon2 from "../../assets/images/profile_image2.svg";
import Profile_icon3 from "../../assets/images/profile_icon3.svg";
import Profile_icon4 from "../../assets/images/profile_image4.svg";
import Profile_icon5 from "../../assets/images/profile_image5.svg";
import Profile_icon6 from "../../assets/images/profile_image6.svg";
import Dark_Profile_icon1 from "../../assets/images/dark_profile_icon1.svg";
import Dark_Profile_icon2 from "../../assets/images/dark_profile_icon2.svg";
import Dark_Profile_icon3 from "../../assets/images/dark_profile_icon3.svg";
import Dark_Profile_icon4 from "../../assets/images/dark_profile_icon4.svg";
import Dark_Profile_icon5 from "../../assets/images/dark_profile_icon5.svg";
import Dark_Profile_icon6 from "../../assets/images/dark_profile_icon6.svg";

export const pages = [
    {
        id: 1,
        image: ecole,
        heading: 'Bienvenue sur Brillaz Camp ! Achetez ou prêtez facilement le matériel pour votre aventure. ',
        // heading: 'Bienvenue sur Brillaz Camp ! Achetez ou prêtez facilement le matériel pour votre aventure. ',
    },
    {
        id: 2,
        image: R,
        heading: 'Trouvez facilement le matériel de camp dont vous avez besoin, en quelques clics seulement.',
        // heading: 'Trouvez facilement le matériel de camp dont vous avez besoin, en quelques clics seulement.',
        
    },
    {
        id: 3,
        image: freepik,
        heading: 'Votre camp, votre matériel, en toute simplicité. Appuyez sur Suivant pour en savoir plus !',
    },
    // heading: 'Votre camp, votre matériel, en toute simplicité. Appuyez sur Suivant pour en savoir plus !',
];

export const log_method = [
   
    {
        id: 2,
        icon: <Google />,
        text: 'Continuer avec Google',
    }, 
    // {
    //     id: 1,
    //     icon: <Apple />,
    //     text: 'Continue With Apple',
    // },
    // {
    //     id: 3,
    //     icon: <Facebook />,
    //     text: 'Continue With Facebook',
    // },
]

export const Action_data = [
    {
        id: 1,
        icon : <Action1 />,
        text: "Make Order",
    },
    {
        id: 2,
        icon : <Action2 />,
        text: "Prices",
    },
    {
        id: 3,
        icon : <Action3 />,
        text: "Help Center",
    },
    {
        id: 4,
        icon : <Action4 />,
        text: "Nearby Drop",
    },
]

export const Transaction_data = [
    {
        id: 1,
        icon : <Transaction />,
        name: 'New Order Made!',
        text: 'You have created a new shipping order',
        time: '2 hours ago',
    },
    {
        id: 2,
        icon : <Transaction />,
        name: 'Top Up Success-full',
        text: 'You have created a new shipping order',
        time: '4 hours ago',
    },
]

export const transaction_history =[
    {
        id: 1,
        Name: 'New Order Made!',
        text: 'You have created a new shipping order',
        time: '2 hours ago',
    },
    {
        id: 2,
        Name: 'Payment Revers',
        text: 'You have created a new shipping order',
        time: '3 hours ago',
    },
    {
        id: 3,
        Name: 'New Order Made!',
        text: 'You have created a new shipping order',
        time: '4 hours ago',
    },
    {
        id: 4,
        Name: 'Payment Revers',
        text: 'You have created a new shipping order',
        time: '4 hours ago',
    },
    {
        id: 5,
        Name: 'New Order Made!',
        text: 'You have created a new shipping order',
        time: '4 hours ago',
    },
    {
        id: 6,
        Name: 'Payment Revers',
        text: 'You have created a new shipping order',
        time: '4 hours ago',
    },
    {
        id: 7,
        Name: 'New Order Made!',
        text: 'You have created a new shipping order',
        time: '4 hours ago',
    },
    {
        id: 8,
        Name: 'Payment Revers',
        text: 'You have created a new shipping order',
        time: '4 hours ago',
    },
    {
        id: 9,
        Name: 'New Order Made!',
        text: 'You have created a new shipping order',
        time: '5 hours ago',
    },
]

export const notify_data = [
    {
        id: 1,
        icon: <Notify1 />,
        name: 'Security Updates!',
        date: '20 Dec, 2024',
        time: '20:49 pm',
    },
    {
        id: 2,
        icon: <Notify2 />,
        name: 'Multiple Wallet Features!',
        date: '19 Dec, 2024',
        time: '18:27 pm',
    },
    {
        id: 3,
        icon: <Notify3 />,
        name: 'Order Has Updated',
        date: '19 Dec, 2024',
        time: '18:27 pm',
    },
    {
        id: 4,
        icon: <Notify4 />,
        name: 'NFT Imported',
        date: '17 Nov, 2024',
        time: '03:31 pm',
    },
]

export const track_tab = [
    {
        id: 1,
        text: 'From Me',
    },
    {
        id: 2,
        text: 'To Me',
    }
]

export const track_stack =  [
    {
        id: 1,
        track_no: 'VK3728732',
        status: 'On the way to delivery',
        process: 'On process',
    },
    {
        id: 2,
        track_no: 'VK3728733',
        status: 'On the way to delivery',
        process: 'On process',
    },
    {
        id: 3,
        track_no: 'VK3728734',
        status: 'On the way to delivery',
        process: 'On process',
    },
    {
        id: 4,
        track_no: 'VK3728735',
        status: 'On the way to delivery',
        process: 'On process',
    },
    {
        id: 5,
        track_no: 'VK3728736',
        status: 'On the way to delivery',
        process: 'On process',
    },
    {
        id: 6,
        track_no: 'VK3728737',
        status: 'On the way to delivery',
        process: 'On process',
    },
    {
        id: 7,
        track_no: 'VK3728738',
        status: 'On the way to delivery',
        process: 'On process',
    },
    {
        id: 8,
        track_no: 'VK3728739',
        status: 'On the way to delivery',
        process: 'On process',
    },
]

export const track_stack2 =  [
    {
        id: 1,
        track_no: 'VK3728732',
        status: 'On the way to delivery',
        process: 'On process',
    },
    {
        id: 2,
        track_no: 'VK3728733',
        status: 'On the way to delivery',
        process: 'On process',
    },
]

export const Transaction_data2 = [
    {
        id: 1,
        icon : <Transaction />,
        name: 'New Order Made!',
        text: 'You have created a new shipping order',
        time: '2 hours ago',
    },
    {
        id: 2,
        icon : <Transaction />,
        name: 'Top Up Success-full',
        text: 'You have created a new shipping order',
        time: '4 hours ago',
    },
    {
        id: 3,
        icon : <Transaction />,
        name: 'Top Up Success-full',
        text: 'You have created a new shipping order',
        time: '4 hours ago',
    },
    {
        id: 4,
        icon : <Transaction />,
        name: 'Top Up Success-full',
        text: 'You have created a new shipping order',
        time: '4 hours ago',
    },
]

export const amount_data = [
    {
        id: 1,
        amount: '$10',
    },
    {
        id: 2,
        amount: '$50',
    },
    {
        id: 3,
        amount: '$100',
    },
    {
        id: 4,
        amount: '$150',
    },
    {
        id: 5,
        amount: '$200',
    },
    {
        id: 6,
        amount: '$250',
    },
    {
        id: 7,
        amount: '$300',
    },
    {
        id: 8,
        amount: '$350',
    },
    {
        id: 9,
        amount: '$450',
    },
]

export const pay_method = [
    {
        id: 1,
        icon: <Google />,
        text: 'Google pay',
    },
    {
        id: 2,
        icon: <Method2 />,
        text: 'PayPal',
    },
    {
        id: 3,
        icon: <Method3 />,
        text: 'Cash app',
    },
    {
        id: 4,
        icon: <Method4 />,
        text: 'Visa Debit Card',
    },
]

export const inbox_tab_data = [
    {
        id: 1,
        text: 'Chat',
    },
    {
        id: 2,
        text: 'Call',
    }
]

export const call_data = [
    {
        id: 1,
        image: Call1, 
        name: 'Brooklyn Simmons',
        call_type: 'Outgoing',
        date: 'Dec 20, 2023',
    },
    {
        id: 2,
        image: Call2, 
        name: 'Brooklyn Simmons',
        call_type: 'Outgoing',
        date: 'Dec 20, 2023',
    },
    {
        id: 3,
        image: Call3, 
        name: 'Brooklyn Simmons',
        call_type: 'Outgoing',
        date: 'Dec 20, 2023',
    },
    {
        id: 4,
        image: Call4, 
        name: 'Brooklyn Simmons',
        call_type: 'Outgoing',
        date: 'Dec 20, 2023',
    },
    {
        id: 5,
        image: Call5, 
        name: 'Brooklyn Simmons',
        call_type: 'Outgoing',
        date: 'Dec 20, 2023',
    },
]

export const message_data = [
    {
        id: 1,
        image: <Chat1 />,
        name: 'Leslie Alexander',
        message: 'Hi, Good morning',
        time: '10:00',
        noof: 1,
    },
    {
        id: 2,
        image: <Chat2 />,
        name: 'Marvin McKinney',
        message: 'OMG, this is amazing',
        time: '10:00',
        noof: 1,
    },
    {
        id: 3,
        image: <Chat3 />,
        name: 'Eleanor Pena',
        message: 'I’ll be there in 2hr',
        sender: 'You: ',
        time: 'Yesterday',
    },
    {
        id: 4,
        image: <Chat4 />,
        name: 'Bessie Cooper',
        message: 'Wow',
        time: '10:00',
        sender: 'You: ',
    },
    {
        id: 5,
        image: <Chat5 />,
        name: 'Guy Hawkins',
        message: 'Perfect',
        time: '10:00',
        sender: 'You: ',
        noof: 4,
    },
]

export const your_chat = [
    {
        id: 1,
        chat: 'Hi! Good Morning dude',
        time: '10:02',
    },
    {
        id: 2,
        chat: 'I Have placed an order for shipping goods for today',
        time: '10:02',
    },
]

export const others_chat = [
    {
        id: 1,
        chat: 'Hi! Good Morning dude',
        time: '10:02',
    },
    {
        id: 2,
        chat: 'Alright. I’m currently on my way to pick up you package',
        time: '10:02',
    },
]

export const your_chat2 = [
    {
        id: 1,
        chat: 'Ok! will waiting',
        time: '10:04',
    },
]

export const call_row_data = [
    {
        id: 1,
        icon: <Vector />,
    },
    {
        id: 2,
        icon: <Mic2 />,
    },
    {
        id: 3,
        icon: <Volume />,
    },
]

export const map_modal = [
    {
        id: 1,
        location: '9081 Lakewood Gardens Junction',
        date: 'December 22, 2024 | 09:44 am',
    },
    {
        id: 2,
        location: '9081 Lakewood Gardens Junction',
        date: 'December 22, 2024 | 09:44 am',
    },
    {
        id: 3,
        location: '9081 Lakewood Gardens Junction',
        date: 'December 22, 2024 | 09:44 am',
    },
]
 
export const profile_data = [
    {
        id: 1,
        name: 'My Orders',
        icon: <Profile_icon1 />,
        dark_icon: <Dark_Profile_icon1 />,
        route: 'My_orders',
    },
    {
        id: 2,
        name: 'Address',
        icon: <Profile_icon2 />,
        dark_icon: <Dark_Profile_icon2 />,
    },

    {
        id: 3,
        name: 'Dark Mode',
        icon: <Profile_icon3 />,
        dark_icon: <Dark_Profile_icon3 />,
    },
    {
        id: 4,
        name: 'Payments Methods',
        icon: <Profile_icon4 />,
        dark_icon: <Dark_Profile_icon4 />,
    },
    {
        id: 5,
        name: 'Offers',
        icon: <Profile_icon5 />,
        dark_icon: <Dark_Profile_icon5 />,
    },
    {
        id: 6,
        name: 'Support',
        icon: <Profile_icon6 />,
        dark_icon: <Dark_Profile_icon6 />,
    },
]
