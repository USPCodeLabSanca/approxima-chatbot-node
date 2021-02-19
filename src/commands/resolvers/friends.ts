import { isProd } from '../../helpers';
import { CommandStateResolver } from '../../models/commands';
import { ApproximaClient } from '../../services/client';
import { IUser } from '../../models/user';

interface IFriendsContext {
	pagesText: string[];
	currentPage: number;
}

const makeButtons = (curPage: number, final_page: number) => {
	// All pages are passed as 0-based. Then, when returning the buttons with
	// structure (text, callback_data), callback_data is 0-based and text is 1-based

	const buttonPairs: any[] = [];

	// there is only one page, button are not needed
	if (final_page == 0) {
		return buttonPairs; // empty
	}
	if (final_page <= 4) {
		// Sei que nro de botoes é certinho o nro de paginas
		const num_buttons = final_page + 1;

		for (let page = 0; page < num_buttons; page++) {
			if (page == curPage) {
				buttonPairs[page] = [`⦗${page + 1}⦘`, `${page}`];
			}
			else {
				buttonPairs[page] = [`${page + 1}`, `${page}`];
			}
		}
		return buttonPairs.map(
			(button: any) => ({ text: button[0], callback_data: button[1] })
		);
	}

	// For here on it is guaranteed that there are more than 5 pages and, thus,
	// there are always 5 buttons

	// Build the first page button
	if (curPage == 0) {
		buttonPairs.push(['⦗1⦘', '0']);
	}
	else if (curPage < 3) {
		buttonPairs.push(['1', '0']);
	}
	else { // going back to first page is a huge step
		buttonPairs.push(['« 1 ', '0']);
	}

	// Middle buttons

	if (curPage < 3) {
		for (const page of [1, 2]) {
			if (page == curPage) {
				buttonPairs.push([`⦗${page + 1}⦘`, `${page}`]);
			}
			else {
				buttonPairs.push([`${page + 1}`, `${page}`]);
			}
		}
		buttonPairs.push(['4 ›', '3']);
	}
	else if (curPage > final_page - 3) {
		buttonPairs.push([`‹ ${final_page - 2}`, `${final_page - 3}`]);
		for (let page = final_page - 2; page < final_page; page++) {
			if (page == curPage) {
				buttonPairs.push([`⦗${page + 1}⦘`, `${page}`]);
			}
			else {
				buttonPairs.push([`${page + 1}`, `${page}`]);
			}
		}
	}
	else {
		buttonPairs.push([`‹ ${curPage}`, `${curPage - 1}`]);
		buttonPairs.push([`⦗${curPage + 1}⦘`, `${curPage}`]);
		buttonPairs.push([`${curPage + 2} ›`, `${curPage + 1}`]);
	}

	// Build the last page button
	if (curPage == final_page) {
		buttonPairs.push([`⦗${final_page + 1}⦘`, `${final_page}`]);
	}
	else if (curPage > final_page - 3) {
		buttonPairs.push([`${final_page + 1}`, `${final_page}`]);
	}
	else { // going to the last page is a huge step
		buttonPairs.push([`${final_page + 1} »`, `${final_page}`]);
	}

	return buttonPairs.map(
		(button: any) => ({ text: button[0], callback_data: button[1] })
	);
};

const correctFriendsOrder = (listOfFriendsInfo: IUser[], correctIdOrder: number[]): IUser[] => {
	function sortFriends(f1: IUser, f2: IUser) {
		return correctIdOrder.indexOf(f1._id) - correctIdOrder.indexOf(f2._id);
	}

	return listOfFriendsInfo.sort(sortFriends);
};

const friendsPaginator = async (client: ApproximaClient, connections: number[]) => {
	const resultingPages = [];

	const divider = '\n\n' +
		'='.repeat(32) +
		'\n\n';

	// Vitão: Limit beatifully crafted by hand
	// Lui: kkkkkkk 👌
	const msgLimit = 1300;

	let curPageText = '';

	let connectionsInfo = await client.db.user.getAllFromList(connections);

	if (connectionsInfo.length == 0) {
		throw new Error('Connections info array is empty.');
	}

	connectionsInfo = correctFriendsOrder(connectionsInfo, connections);

	// Adding friends info to the message
	for (const userInfo of connectionsInfo) {

		if (!userInfo) continue;

		// Format their info on a string
		let userInfoTxt = `${userInfo['name']}\n` +
			`Clique aqui para conversar --> ${userInfo['username']}\n\n` +
			`"${userInfo['bio']}"`;

		// If userInfoTxt is greater than the limit (+ the divider), TRUNCATE IT!
		if (userInfoTxt.length > (msgLimit - divider.length)) {
			userInfoTxt = userInfoTxt.substr(0, msgLimit - divider.length - 4) + '..."';
		}
		userInfoTxt += divider;

		// If adding one more user is gonna break the msg limit
		if (curPageText.length + userInfoTxt.length > msgLimit) {
			resultingPages.push(curPageText);
			curPageText = '';
		}
		curPageText += userInfoTxt;
	}
	resultingPages.push(curPageText);

	return resultingPages;
};

export const friendsCommand: CommandStateResolver<'friends'> = {
	INITIAL: async (client, arg) => {
		/*
		 /friends => Mostra o contato (@ do Tele) de todas as pessoas com que o usuário
		 já se conectou.

		 /friends last => Ultima amigo adicionado
		 */

		const beginDate = Date.now();
		// facilita na hora de referenciar esse usuario
		const state = client.getCurrentState<IFriendsContext>();
		const currentUser = state.currentUser;

		state.context.currentPage = 0;

		if (currentUser.connections.length === 0) {
			// Este usuario ainda nao tem conexoes
			const response = 'Você ainda não possui nenhuma conexão!\n' +
				'Que tal usar o comando /show para conhecer alguém novo?';

			client.sendMessage(response);

			return 'END';
		}

		// Se chegou ate aqui é porque ele tem conexoes.
		// Porém, temos que checar se as conexões estão ativas.

		const connectionsSet = isProd ?
			// @ts-ignore
			Array.from(new Set(currentUser.connections)) :
			currentUser.connections;

		// Corrige as suas conexoes caso hajam repetições
		if (connectionsSet.length < currentUser.connections.length) {
			// Existem repeticoes no original
			currentUser.connections = connectionsSet;
			client.db.user.edit(currentUser._id, { connections: currentUser.connections });
		}

		// Exibição do amigos em lista paginada
		const bottomMsg = 'Utilize esses botões para navegar entre as páginas:\n\n';

		// Cria paginação da lista de amigos(connectionSet)
		let pagesTextList;
		try {
			// Selecione apenas o ultimo amigo
			if (arg == 'last') {
				pagesTextList = await friendsPaginator(client, [connectionsSet[connectionsSet.length - 1]]);
			}
			else {
				pagesTextList = await friendsPaginator(client, connectionsSet);
			}

		}
		catch (err) {
			const response = 'Erro ao recuperar a sua lista de conexões. Tente novamente em instantes.';
			client.sendMessage(response);
			return 'END';
		}

		state.context.pagesText = pagesTextList;

		const buttonPairs = makeButtons(0, pagesTextList.length - 1);

		let response = pagesTextList[0];

		if (buttonPairs.length !== 0) {
			response += bottomMsg;
		}

		const endDate = Date.now();
		client.registerAction('friends_command', { ellapsed_time: endDate - beginDate });

		const message = await client.sendMessage(response, {
			reply_markup: {
				inline_keyboard: [
					buttonPairs, [{ text: 'Fechar', callback_data: 'close' }]
				]
			}
		});

		state.endKeyboardCommandOnText = {
			deleteKeyboard: true,
			keyboardId: message.message_id
		};

		return 'CHOOSE_PAGE';
	},
	CHOOSE_PAGE: (clients, arg) => {

		const state = clients.getCurrentState<IFriendsContext>();

		if (arg === 'close') {
			clients.deleteMessage();
			// Don't delete the message because I already did it here
			state.endKeyboardCommandOnText = undefined;
			return 'END';
		}

		const currentPage = +arg;

		if (isNaN(currentPage)) {
			// TODO: tratar esse caso
			clients.deleteMessage();
			return 'END';
		}

		if (currentPage === state.context.currentPage) {
			return 'CHOOSE_PAGE';
		}

		state.context.currentPage = currentPage;
		const bottom_msg = 'Utilize esses botões para navegar entre as páginas:\n\n';


		const buttonPairs = makeButtons(currentPage, state.context.pagesText.length - 1);

		let response = state.context.pagesText[currentPage];

		if (buttonPairs.length != 0) {
			response += bottom_msg;
		}

		clients.editMessage(
			response,
			{
				reply_markup: {
					inline_keyboard: [
						buttonPairs,
						[{ text: 'Fechar', callback_data: 'close' }]
					]
				}
			}
		);

		return 'CHOOSE_PAGE';
	}
};
