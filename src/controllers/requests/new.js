function RequestsNewCtrl($scope, $state, $http, $auth) {
  $scope.recordToDisplay = [];
  $scope.userRecords = [];
  $scope.offerArray = [];
  $scope.offerDisplay = [];
  $scope.data = {};
  $scope.currentUserId = $auth.getPayload().sub;

  $scope.addToOffer = function(recordId, recordTitle, recordArtist) {
    $scope.offerArray.push(recordId);
    $scope.offerDisplay.push(`${recordTitle} by ${recordArtist}`);
  };

  $scope.submitRequest = function(currentUserId) {
    $http({
      method: 'POST',
      url: `/api/records/${$state.params.id}/requests`,
      data: $scope.data
    })
      .then(() => $state.go('usersShow', { id: currentUserId }));
  };

  $http({
    method: 'GET',
    url: `/api/records/${$state.params.id}/requests`
  })
    .then(res => {
      $scope.records = res.data;
      $scope.records.forEach(record => {
        if(record._id === $state.params.id) {
          $scope.recordToDisplay.push(record);
        } else if(record.owner._id === $auth.getPayload().sub) {
          $scope.userRecords.push(record);
        }
      });
    });
}

export default RequestsNewCtrl;
