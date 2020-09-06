import { CommandStateResolver } from '../../models/command';
import { categories } from '../../services/categories';

interface IPrefsContext {
  subMenu: string;
}

// const buildKeyboard = (context: IPrefsContext) => {
//   const keyboard = []

//   const {
//     subMenu
//   } = context;

//   let categoriesToShow: any[] = []

//   if (!subMenu) {
//     categoriesToShow = categories
//   }
//   else {
//     categoriesToShow = categories[subMenu][1]
//   }

//   for (category of categoriesToShow) {

//     if (subMenu) {

//       categoryId = str(categories[subMenu][0]) + \
//       "," + str(categoriesToShow[category][0])
//     }
//     else {

//     }
//   }
//   categoryId = str(categoriesToShow[category][0])

//   categorySubMenuText = '|sub' + subMenu if subMenu else ''

//   if not subMenu and isinstance(categories[category][1], dict) and len(categories[category][1].keys()) > 0:
//     categoryText = category + " ⬊"
//     callbackText = "open" + category
//     elif categoryId in d:
//     category_text = "✅ " + category
//     callbackText = "toggle" + categoryId + categorySubMenuText
//             else:
//     category_text = category
//     callbackText = "toggle" + categoryId + categorySubMenuText
//     keyboard.append([
//       InlineKeyboardButton(category_text, callback_data = callbackText)
//     ])

//     if subMenu:
//       keyboard.append(
//         [InlineKeyboardButton("⬉ VOLTAR", callback_data = "goback")]
//       )

//     keyboard.append(
//       [InlineKeyboardButton("❰ ENVIAR ❱", callback_data = "finish")]
//     )

//   return keyboard
// };

export const prefsCommand: CommandStateResolver<'prefs'> = {
  INITIAL: (client) => {
    client.sendMessage('');
    return 'CHOOSING';
  },
  CHOOSING: (_client, arg) => {
    // const context = client.getCurrentContext<IPrefsContext>();
    if (arg === 'submit') {
      return 'SUBMIT';
    }
    //
    return 'CHOOSING';
  },
  SUBMIT: () => {
    return 'END';
  }
};
