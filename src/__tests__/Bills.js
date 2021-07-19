import { fireEvent, screen } from '@testing-library/dom';
import BillsUI from '../views/BillsUI.js';
import { bills } from '../fixtures/bills.js';
import Bills from '../containers/Bills.js';
import Router from '../app/Router';
import { ROUTES, ROUTES_PATH } from '../constants/routes';
import Firestore from '../app/Firestore';
import firebase from '../__mocks__/firebase';
import { localStorageMock } from '../__mocks__/localStorage.js';

describe('Given I am connected as an employee', () => {
    describe('When I am on Bills Page', () => {
        test('Then window icon in vertical layout should be highlighted', () => {
            Firestore.bills = () => ({
                bills,
                get: jest.fn().mockResolvedValue(),
            });
            const pathname = ROUTES_PATH['Bills'];
            Object.defineProperty(window, 'location', {
                value: { hash: pathname },
            });
            window.localStorage.setItem(
                'user',
                JSON.stringify({
                    type: 'Employee',
                })
            );
            document.body.innerHTML = `<div id="root"></div>`;
            Router();
            expect(
                screen
                    .getByTestId('icon-window')
                    .classList.contains('active-icon')
            ).toBeTruthy();
        });

        test('Then bills should be ordered from earliest to latest', () => {
            const billsRendered = [...bills];
            billsRendered.map(bill => {
                bill.formatedDate = bill.date;
            });
            const html = BillsUI({ data: billsRendered });
            document.body.innerHTML = html;
            const dates = screen
                .getAllByText(
                    /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
                )
                .map(a => a.innerHTML);
            const antiChrono = (a, b) => (a < b ? 1 : -1);
            const datesSorted = [...dates].sort(antiChrono);
            expect(dates).toEqual(datesSorted);
        });

        test('Then loading page should be rendered', () => {
            const html = BillsUI({ loading: true });
            document.body.innerHTML = html;
            expect(screen.getAllByText('Loading...')).toBeTruthy();
        });

        test('Then, error should be rendered', () => {
            const html = BillsUI({ error: 'error' });
            document.body.innerHTML = html;
            expect(screen.getAllByText('Erreur')).toBeTruthy();
        });

        describe('When I click on the eye icon', () => {
            test('Then a modal should be open', () => {
                const html = BillsUI({ data: bills });
                document.body.innerHTML = html;
                const onNavigate = pathname => {
                    document.body.innerHTML = ROUTES({ pathname });
                };
                const bill = new Bills({
                    document,
                    onNavigate,
                    firestore: null,
                    localStorage: window.localStorage,
                });
                $.fn.modal = jest.fn();
                const iconEye = screen.getAllByTestId('icon-eye')[0];
                const handleClickIconEye = jest.fn(e => {
                    e.preventDefault();
                    bill.handleClickIconEye(iconEye);
                });
                iconEye.addEventListener('click', handleClickIconEye);
                fireEvent.click(iconEye);
                expect(handleClickIconEye).toHaveBeenCalled();
            });
        });

        describe('When I click on the "New Bill" button', () => {
            test('Then NewBill page should be rendered', () => {
                const html = BillsUI({ data: [] });
                document.body.innerHTML = html;
                const onNavigate = pathname => {
                    document.body.innerHTML = ROUTES({ pathname });
                };
                const bill = new Bills({
                    document,
                    onNavigate,
                    firestore: null,
                    localStorage: window.localStorage,
                });
                const button = document.querySelector(
                    '[data-testid=btn-new-bill]'
                );
                const buttonNewBill = jest.fn(e => bill.handleClickNewBill(e));
                button.addEventListener('click', buttonNewBill);
                fireEvent.click(button);
                expect(buttonNewBill).toHaveBeenCalled();
            });
        });
    });

    // Intégration test GET
    describe('When I navigate to Bills UI', () => {
        test('fetches bills from mock API GET', async () => {
            const getSpy = jest.spyOn(firebase, 'get');
            const bills = await firebase.get();
            expect(getSpy).toHaveBeenCalledTimes(1);
            expect(bills.data.length).toBe(4);
        });
        test('fetches bills from an API and fails with 404 message error', async () => {
            firebase.get.mockImplementationOnce(() =>
                Promise.reject(new Error('Erreur 404'))
            );
            const html = BillsUI({ error: 'Erreur 404' });
            document.body.innerHTML = html;
            const message = await screen.getByText(/Erreur 404/);
            expect(message).toBeTruthy();
        });
        test('fetches messages from an API and fails with 500 message error', async () => {
            firebase.get.mockImplementationOnce(() =>
                Promise.reject(new Error('Erreur 500'))
            );
            const html = BillsUI({ error: 'Erreur 500' });
            document.body.innerHTML = html;
            const message = await screen.getByText(/Erreur 500/);
            expect(message).toBeTruthy();
        });
    });
});
