import React from 'react';
import { ReactComponent as Tickets } from './icons/tickets.svg';
import { ReactComponent as Settings } from './icons/settings.svg';
import { ReactComponent as Arrow } from './icons/arrow.svg';
import { ReactComponent as Logout } from './icons/logout.svg';
import { ReactComponent as User } from './icons/user.svg';
import { ReactComponent as Back } from './icons/back.svg';
import { ReactComponent as Logo } from './icons/logo.svg';
import { ReactComponent as ArrowRight } from './icons/arrow-right.svg';
import { ReactComponent as Delete } from './icons/delete.svg';
import { ReactComponent as Info } from './icons/info.svg';
import { ReactComponent as Edit } from './icons/edit.svg';
import { ReactComponent as Done } from './icons/done.svg';
import { ReactComponent as Cancel } from './icons/cancel.svg';
import { ReactComponent as Add } from './icons/add.svg';
import { ReactComponent as CurrencyRuble } from './icons/currency-ruble-circle.svg';
import { ReactComponent as FileCheck } from './icons/file-check.svg';
import { ReactComponent as FilePlus } from './icons/file-plus.svg';
import { ReactComponent as TgSettings } from './icons/tg-settings.svg';
import { ReactComponent as Copy } from './icons/copy.svg';
import { ReactComponent as PlusSquare } from './icons/plus-square.svg';
import { ReactComponent as ChevronUp } from './icons/chevron-up.svg';
import { ReactComponent as ChevronDown } from './icons/chevron-down.svg';
import { ReactComponent as Tgaddbutton } from './icons/tgaddbutton.svg';
import { ReactComponent as Download } from './icons/download.svg';
import { ReactComponent as Mail } from './icons/mail.svg';
import { ReactComponent as Telegram } from './icons/telegram.svg';
import { ReactComponent as CheckedLine } from './icons/checked-line.svg';
import { ReactComponent as Clip } from './icons/clip.svg';
import { ReactComponent as File } from './icons/file.svg';
import { ReactComponent as Phone } from './icons/phone.svg';
import { ReactComponent as Duplicate } from './icons/duplicate.svg';
import { ReactComponent as CheckedLineWhite } from './icons/checked-line-white.svg';
import { ReactComponent as Share } from './icons/share.svg';
import { ReactComponent as DownloadTg } from './icons/download-tg.svg';
import { ReactComponent as FileB } from './icons/file-b.svg';
import { ReactComponent as Car } from './icons/car.svg';
import { ReactComponent as PencilLine } from './icons/pencil-line.svg';
import { ReactComponent as BigCheckbox } from './icons/big-checkbox.svg';
import { ReactComponent as Apartment } from './icons/apartment.svg';
import { ReactComponent as Home } from './icons/home.svg';
import { ReactComponent as Garage } from './icons/garage.svg';
import { ReactComponent as Sauna } from './icons/sauna.svg';
import { ReactComponent as FileDone } from './icons/file-done.svg';
import { ReactComponent as FileUp } from './icons/file-up.svg';
import { ReactComponent as MesageCircleLines } from './icons/message-circle-lines.svg';
import { ReactComponent as Star } from './icons/star.svg';
import { ReactComponent as NavUsers } from './icons/nav-users.svg';
import { ReactComponent as ShieldCheck } from './icons/shield-check.svg';
import { ReactComponent as Banknotes } from './icons/banknotes.svg';
import { ReactComponent as Grid } from './icons/grid.svg';
import { ReactComponent as ArrowRightBlack } from './icons/arrow-right-black.svg';
import { ReactComponent as Plus } from './icons/plus.svg';
import { ReactComponent as Check } from './icons/check.svg';
import { ReactComponent as Pencil } from './icons/pencil.svg';
import { ReactComponent as Messages } from './icons/messages.svg';
import { ReactComponent as ButtonSend } from './icons/button-send.svg';
import { ReactComponent as XClose } from './icons/x-close.svg';
import { ReactComponent as Distribution } from './icons/distribution.svg';
import { ReactComponent as Pdf } from './icons/pdf.svg';
import { ReactComponent as DocumentFile } from './icons/document.svg';
import { ReactComponent as CoupeCar } from './icons/coupe-car.svg';
import { ReactComponent as Home3 } from './icons/home-03.svg';
import { ReactComponent as Briefcase } from './icons/briefcase.svg';
import { ReactComponent as Question } from './icons/question.svg';
import { ReactComponent as Copy2 } from './icons/copy2.svg';
import { ReactComponent as Share2 } from './icons/share2.svg';
import { ReactComponent as Attachment } from './icons/attachment.svg';
import { ReactComponent as Folder } from './icons/folder.svg';
import { ReactComponent as InfoCircle } from './icons/info-circle.svg';
import { ReactComponent as CurrencyRubleIcon } from './icons/currency-ruble-icon.svg';
import { ReactComponent as UsersTg } from './icons/users-tg.svg';
import { ReactComponent as ChevronRight } from './icons/chevron-right.svg';
import { ReactComponent as ArrowNarrowLeft } from './icons/arrow-narrow-left.svg';
import { ReactComponent as Notifi } from './icons/notifi.svg';

const Icon = (props) => {
    const {
        name,
        color
    } = props;


    switch (name) {
        case 'tickets':
            return <Tickets
                className='icon tickets'
                stroke={color ?? "#303940"}
                {...props}
            />
        case 'settings':
            return <Settings
                className='icon settings'
                {...props}
                stroke={color ?? "#303940"}
            />
        case 'arrow':
            return <Arrow
                className='icon arrow'
                stroke={color ?? "#303940"}
                {...props}
            />
        case 'arrow-right':
            return <ArrowRight
                className='icon arrow-right'
                stroke={color ?? "#303940"}
                {...props}
            />
        case 'logout':
            return <Logout
                className='icon logout'
                fill={color ?? "#F2271C"}
                {...props}
            />
        case 'pdf':
            return <Pdf
                className='icon pdf'
                fill={color ?? "#F2271C"}
                {...props}
            />
        case 'document':
            return <DocumentFile
                className='icon document'
                fill={color ?? "#F2271C"}
                {...props}
            />
        case 'user':
            return <User
                className='icon user'
                stroke={color ?? "#303940"}
                {...props}
            />
        case 'back':
            return <Back
                className='icon back'
                stroke={color ?? "#303940"}
                {...props}
            />
        case 'logo':
            return <Logo
                className='icon logo'
                {...props}
            />
        case 'delete':
            return <Delete
                className='icon delete'
                {...props}
            />
        case 'info':
            return <Info
                className='icon info'
                {...props}
            />
        case 'edit':
            return <Edit
                className='icon edit'
                {...props}
            />
        case 'done':
            return <Done
                className='icon done'
                {...props}
            />
        case 'cancel':
            return <Cancel
                className='icon cancel'
                {...props}
            />
        case 'add':
            return <Add
                className='icon add'
                {...props}
            />
        case 'currency-ruble':
            return <CurrencyRuble
                className='icon currency-ruble'
                {...props}
            />
        case 'file-check':
            return <FileCheck
                className='icon file-check'
                {...props}
            />
        case 'users':
            return <FileCheck
                className='icon users'
                {...props}
            />
        case 'file-plus':
            return <FilePlus
                className='icon file-plus'
                {...props}
            />
        case 'tg-settings':
            return <TgSettings
                className='icon tg-settings'
                {...props}
            />
        case 'copy':
            return <Copy
                className='icon copy'
                {...props}
            />
        case 'plus-square':
            return <PlusSquare
                className='icon plus-square'
                {...props}
            />
        case 'chevron-up':
            return <ChevronUp
                className='icon chevron-up'
                {...props}
            />
        case 'chevron-down':
            return <ChevronDown
                className='icon chevron-down'
                {...props}
            />
        case 'tgaddbutton':
            return <Tgaddbutton
                className='icon tgaddbutton'
                {...props}
            />
        case 'download':
            return <Download
                className='download'
                {...props}
            />
        case 'mail':
            return <Mail
                className='mail'
                {...props}
            />
        case 'telegram':
            return <Telegram
                className='telegram'
                {...props}
            />
        case 'checked-line':
            return <CheckedLine
                className='checked-line'
                {...props}
            />
        case 'clip':
            return <Clip
                className='clip'
                {...props}
            />
        case 'file':
            return <File
                className='file'
                {...props}
            />
        case 'phone':
            return <Phone
                className='phone'
                {...props}
            />
        case 'duplicate':
            return <Duplicate
                className='duplicate'
                {...props}
            />
        case 'checked-line-white':
            return <CheckedLineWhite
                className='checked-line-white'
                {...props}
            />
        case 'share':
            return <Share
                className='share'
                {...props}
            />
        case 'download-tg':
            return <DownloadTg
                className='download-tg'
                {...props}
            />
        case 'file-b':
            return <FileB
                className='file-b'
                {...props}
            />
        case 'car':
            return <Car
                className='car'
                {...props}
            />
        case 'pencil-line':
            return <PencilLine
                className='pencil-line'
                {...props}
            />
        case 'big-checkbox':
            return <BigCheckbox
                className='big-checkbox'
                {...props}
            />
        case 'apartment':
            return <Apartment
                className='apartment'
                {...props}
            />
        case 'home':
            return <Home
                className='home'
                {...props}
            />
        case 'garage':
            return <Garage
                className='garage'
                {...props}
            />
        case 'sauna':
            return <Sauna
                className='sauna'
                {...props}
            />
        case 'file-done':
            return <FileDone
                className='file-done'
                {...props}
            />
        case 'file-up':
            return <FileUp
                className='file-up'
                {...props}
            />
        case 'message-circle-lines':
            return <MesageCircleLines
                className='message-circle-lines'
                {...props}
            />
        case 'star':
            return <Star
                className='star'
                {...props}
            />
        case 'nav-users':
            return <NavUsers
                className='nav-users'
                {...props}
            />
        case 'shield-check':
            return <ShieldCheck
                className='shield-check'
                {...props}
            />
        case 'banknotes':
            return <Banknotes
                className='banknotes'
                {...props}
            />
        case 'grid':
            return <Grid
                className='grid'
                {...props}
            />
        case 'arrow-right-black':
            return <ArrowRightBlack
                className='arrow-right-black'
                {...props}
            />
        case 'plus':
            return <Plus
                className='plus'
                {...props}
            />
        case 'check':
            return <Check
                className='check'
                {...props}
            />
        case 'pencil':
            return <Pencil
                className='pencil'
                {...props}
            />
        case 'messages':
            return <Messages
                className='messages'
                {...props}
            />
        case 'button-send':
            return <ButtonSend
                className='button-send'
                {...props}
            />
        case 'x-close':
            return <XClose
                className='x-close'
                {...props}
            />
        case 'distribution':
            return <Distribution
                className='distribution'
                {...props}
            />
        case 'coupe-car':
            return <CoupeCar
                className='coupe-car'
                {...props}
            />
        case 'home-03':
            return <Home3
                className='home-03'
                {...props}
            />
        case 'briefcase':
            return <Briefcase
                className='briefcase'
                {...props}
            />
        case 'question':
            return <Question
                className='question'
                {...props}
            />
        case 'copy2':
            return <Copy2
                className='copy2'
                {...props}
            />
        case 'share2':
            return <Share2
                className='share2'
                {...props}
            />
        case 'attachment':
            return <Attachment
                className='attachment'
                {...props}
            />
        case 'folder':
            return <Folder
                className='folder'
                {...props}
            />
        case 'info-circle':
            return <InfoCircle
                className='info-circle'
                {...props}
            />
        case 'currency-ruble-icon':
            return <CurrencyRubleIcon
                className='currency-ruble-icon'
                {...props}
            />
        case 'users-tg':
            return <UsersTg
                className='users-tg'
                {...props}
            />
        case 'chevron-right':
            return <ChevronRight
                className='chevron-right'
                {...props}
            />
        case 'arrow-narrow-left':
            return <ArrowNarrowLeft
                className='arrow-narrow-left'
                {...props}
            />
        case 'notifi':
            return <Notifi
                className='notifi'
                {...props}
            />
        default:
            return <></>
    };

};

export default Icon;

