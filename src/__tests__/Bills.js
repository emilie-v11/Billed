import { fireEvent, screen } from '@testing-library/dom';
import BillsUI from '../views/BillsUI.js';
import { bills } from '../fixtures/bills.js';
import userEvent from '@testing-library/user-event';

describe('Given I am connected as an employee', () => {
    describe('When I am on Bills Page', () => {
        test('Then bill icon in vertical layout should be highlighted', () => {
            const html = BillsUI({ data: [] });
            document.body.innerHTML = html;
            // to-do write expect expression
        });

        test('Then bills should be ordered from earliest to latest', () => {
            // const html = BillsUI({ data: bills });
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
            // /^((20[0-1]+[0-9]|202[0-1])-(0?[1-9]|1[0-2])-(0?[1-9]|[12]\d|3[01])|(0?[1-9]|[12]\d|3[01])[/](0?[1-9]|1[0-2])[/](20[0-1]+[0-9]|202[0-1]))$/
            const antiChrono = (a, b) => (a < b ? 1 : -1);
            const datesSorted = [...dates].sort(antiChrono);
            expect(dates).toEqual(datesSorted);
        });

        test('Then loading page should be rendered', () => {
            const html = BillsUI({ loading: true });
            document.body.innerHTML = html;
            expect(screen.getAllByText('Loading...')).toBeTruthy();
        });

        test('Then error page should be rendered', () => {
            const html = BillsUI({ error: 'error' });
            document.body.innerHTML = html;
            expect(screen.getAllByText('Erreur')).toBeTruthy();
        });
    });
});
