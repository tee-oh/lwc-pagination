import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class Pagination extends LightningElement {

    @api records;
    @api recordsPerPage;
    @api recordsPerPageHidden = false;

    currentPage = 1;
    initialRecordsPerPage;
    recordsPaginated = [];
    recordsPerPageOptions = [5,10,25,50,100];
    selectedRecordsPerPage;
    totalPages;
    totalRecords;

    connectedCallback(){
        if (this.recordsPerPage == undefined) {
            this.recordsPerPage = 5; //Records per page is defaulted to 5 if value is not set by parent.
        }
        this.initialRecordsPerPage = this.recordsPerPage; //Store static copy of initial records per page value for restoration on pagination reset.
        this.selectedRecordsPerPage = this.recordsPerPage; //Set the selected value of the records per page picklist.
        this.updateRecordsPerPageOptions(); //Update the records per page options array to remove any duplicate value based on selected records per page value.
        this.paginateList(this.records);
    }

    @api
    paginateList(parentList){ //Call this function to paginate a returned list, a search result list, a sorted list, etc.
        this.records = parentList;
        this.totalRecords = this.records.length;
        this.totalPages = Math.ceil(this.totalRecords / this.initialRecordsPerPage);
        this.paginateAndSendResults();
    }

    @api
    resetPagination(){ //Call this function to reset pagination back to default values.
        this.currentPage = 1;
        this.recordsPerPage = this.initialRecordsPerPage;
        this.totalRecords = this.records.length; //Recalculate because a new record pulling into a list upon refresh could increase the record count.
        this.totalPages = Math.ceil(this.totalRecords / this.initialRecordsPerPage); //Recalculate because a new record pulling into a list upon refresh could increase the page count.
        this.selectedRecordsPerPage = this.initialRecordsPerPage;
        this.updateRecordsPerPageOptions();
        this.paginateAndSendResults();
    }

    updateRecordsPerPageOptions(){
        this.recordsPerPageOptions = [5,10,25,50,100];
        for (let i = 0; i < this.recordsPerPageOptions.length; i++) {
            if (this.recordsPerPageOptions[i] == this.recordsPerPage) {
                this.recordsPerPageOptions.splice(i, 1);
            }
        }
    }

    paginateAndSendResults(){
        this.recordsPaginated = [];
        for (let i = (this.currentPage - 1) * this.recordsPerPage; i < this.currentPage * this.recordsPerPage; i++) { 
            if (i === this.totalRecords) {
                break;
            }
            this.recordsPaginated.push(this.records[i]);
        }
        const recordsPaginated = new CustomEvent('recordspaginated', {
            detail : [...this.recordsPaginated]
          })
        this.dispatchEvent(recordsPaginated);
    }

    handleFirstPage() {
        this.currentPage = 1;
        this.paginateAndSendResults();
    }

    handleLastPage() {
        this.currentPage = this.totalPages;
        this.paginateAndSendResults();
    }

    handleNextPage() {
        this.currentPage = this.currentPage < this.totalPages ? this.currentPage + 1 : this.currentPage;
        this.paginateAndSendResults();
    }

    handlePreviousPage() {
        this.currentPage = this.currentPage > 1 ? this.currentPage - 1 : this.currentPage;
        this.paginateAndSendResults();
    }

    handlePageNumberChange(event){       
        if(event.keyCode === 13){ //On 'Enter'.
            this.evaluatePageNumberChange(event);
        }
    }

    evaluatePageNumberChange(event){
        this.currentPage = Number(event.target.value);
        if ((this.currentPage > this.totalPages) || (this.currentPage < 1) ) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'Page selection is out of range. Please try again with a valid page number.',
                    variant: 'error'
                })
            );
        } else {
            this.paginateAndSendResults();
        }
    }

    handleRecordsPerPageChange(event){
        this.recordsPerPage = event.target.value;
        this.currentPage = 1;
        this.selectedRecordsPerPage = this.recordsPerPage;
        this.totalPages = Math.ceil(this.totalRecords / this.recordsPerPage);
        this.updateRecordsPerPageOptions();
        this.paginateAndSendResults();
    }
}
