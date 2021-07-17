import { fireEvent, screen } from '@testing-library/dom';
import BillsUI from '../views/BillsUI.js';
import { bills } from '../fixtures/bills.js';
import Bills from '../containers/Bills.js';
import Router from '../app/Router';
import { ROUTES, ROUTES_PATH } from '../constants/routes';
import userEvent from '@testing-library/user-event';
import Firestore from '../app/Firestore';
import firebase from '../__mocks__/firebase';
import { localStorageMock } from '../__mocks__/localStorage.js';

describe('Given I am connected as an employee', () => {
    describe('When I am on Bills Page', () => {
        test('Then bill icon in vertical layout should be highlighted', () => {
            jest.mock('../app/Firestore');
            Firestore.bills = () => ({
                bills,
                get: jest.fn().mockResolvedValue(),
            });
            Object.defineProperty(window, 'localStorage', {
                value: localStorageMock,
            });
            window.localStorage.setItem(
                'user',
                JSON.stringify({
                    type: 'Employee',
                })
            );
            const pathname = ROUTES_PATH['Bills'];
            Object.defineProperty(window, 'location', {
                value: { hash: pathname },
            });
            document.body.innerHTML = `<div id="root"></div>`;
            Router();
            expect(
                screen
                    .getByTestId('icon-window')
                    .classList.contains('active-icon')
            ).toBeTruthy();
        });

        test('Then bills should be ordered from earliest to latest', () => {
            const billsRended = [...bills];
            billsRended.map(bill => {
                bill.formatedDate = bill.date;
            });
            const html = BillsUI({ data: billsRended });
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

        test('Then if error page should be rendered', () => {
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
            test('Then NewBill page should be rendered', () => {});
        });
    });
});
